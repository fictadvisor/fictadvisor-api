import axios from 'axios';
import { JSDOM } from 'jsdom';
import { URLSearchParams } from 'node:url';
import { Injectable } from '@nestjs/common';
import { Parser } from './Parser';
import { DisciplineTypeEnum, Period, TeacherRole } from '@prisma/client';
import { DisciplineTeacherRepository } from '../../database/repositories/DisciplineTeacherRepository';
import { DisciplineTeacherRoleRepository } from '../../database/repositories/DisciplineTeacherRoleRepository';
import { GroupRepository } from '../../database/repositories/GroupRepository';
import { DisciplineRepository } from '../../database/repositories/DisciplineRepository';
import { SubjectRepository } from '../../database/repositories/SubjectRepository';
import { TeacherRepository } from '../../database/repositories/TeacherRepository';
import { StudyingSemester, DateService, DAY, HOUR, MINUTE, WEEK, FORTNITE } from '../date/DateService';
import { EventRepository } from '../../database/repositories/EventRepository';

export const DISCIPLINE_TYPE = {
  Лек: DisciplineTypeEnum.LECTURE,
  Прак: DisciplineTypeEnum.PRACTICE,
  Лаб: DisciplineTypeEnum.LABORATORY,
};

export const TEACHER_TYPE = {
  Лек: TeacherRole.LECTURER,
  Прак: TeacherRole.PRACTICIAN,
  Лаб: TeacherRole.LABORANT,
};

const SEMESTER = 1;

const VIEW_SCHEDULE_PARAMS = new URLSearchParams({
  __EVENTVALIDATION:
    '/wEdAAEAAAD/////AQAAAAAAAAAPAQAAAAYAAAAIsA3rWl3AM+6E94I5ke7WZqDu1maj7tZmCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANqZqakPTbOP2+koNozn1gOvqUEW',
  __EVENTTARGET: '',
  ctl00$MainContent$ddlSemesterType: SEMESTER.toString(),
});

const WEEK_TAGS = {
  0: 'ctl00_MainContent_FirstScheduleTable',
  1: 'ctl00_MainContent_SecondScheduleTable',
};

@Injectable()
export class RozParser implements Parser {
  constructor (
    private groupRepository: GroupRepository,
    private teacherRepository: TeacherRepository,
    private subjectRepository: SubjectRepository,
    private disciplineRepository: DisciplineRepository,
    private disciplineTeacherRepository: DisciplineTeacherRepository,
    private disciplineTeacherRoleRepository: DisciplineTeacherRoleRepository,
    private eventRepository: EventRepository,
    private dateService: DateService,
  ) {}

  async parse (period: StudyingSemester, groupList: string[], page = 1) {
    let filtered = (await axios.post('http://epi.kpi.ua/Schedules/ScheduleGroupSelection.aspx/GetGroups', {
      count: 10,
      prefixText: 'і',
    })).data.d
      .filter((name: string) => /І[МПКАСОВТ]-([зпв]|зп)?\d\d(мн|мп|ф)?і?/.test(name));

    filtered = groupList.length
      ? filtered.filter((group) => groupList.includes(group))
      : filtered.slice((page - 1) * 40, page * 40);

    for (const group of filtered) {
      if (group.endsWith('ф')) continue;
      await this.parseGroupSchedule(group, period);
    }
  }

  async parseGroupSchedule (code, period) {
    const groupHashId = await this.getGroupHashId(code);
    const url = `http://epi.kpi.ua/Schedules/ViewSchedule.aspx?g=${groupHashId}`;

    const response = await axios.post(url, VIEW_SCHEDULE_PARAMS);

    await new Promise((res) => setTimeout(() => (res('')), 3000));
    const dom = new JSDOM(response.data);

    await this.parseWeek(0, code, dom, period);
    await this.parseWeek(1, code, dom, period);
  }

  async parseWeek (weekNumber, code, dom, period) {
    const week = await this.parseHtmlWeek(weekNumber, code, dom);
    const group = await this.groupRepository.getOrCreate(code);
    for (const pair of week) {
      await this.parsePair(pair, group.id, period);
    }
  }

  async getGroupHashId (group) {
    const SCHEDULE_GROUP_SELECTION_PARAMS = new URLSearchParams({
      __EVENTVALIDATION:
        '/wEdAAEAAAD/////AQAAAAAAAAAPAQAAAAUAAAAIsA3rWl3AM+6E94I5Tu9cRJoVjv0LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHfLZVQO6kVoZVPGurJN4JJIAuaU',
      __EVENTTARGET: '',
      ctl00$MainContent$ctl00$txtboxGroup: group,
      ctl00$MainContent$ctl00$btnShowSchedule: 'Розклад занять',
    });
    const url = 'http://epi.kpi.ua/Schedules/ScheduleGroupSelection.aspx';
    const response = await axios.post(url, SCHEDULE_GROUP_SELECTION_PARAMS);
    const dom = new JSDOM(response.data);

    const form = dom.window.document.querySelector('form[name=\'aspnetForm\']');
    return form.getAttribute('action').split('?g=')[1];
  }

  async parseHtmlWeek (week, group, dom) {
    const pairs = [];
    const table = dom.window.document.getElementById(WEEK_TAGS[week]);

    for (let i = 1; i < table.rows.length; i++) {
      const row = table.rows[i];

      const time = row.childNodes[1].innerHTML.split('<br>')[1];

      for (let j = 2; j < row.childNodes.length; j++) {
        const td = row.childNodes[j];

        // Check for empty day - no lessons
        if (td.innerHTML === '' || td.innerHTML === undefined) continue;

        const day = j - 1;

        const localRowPairs = [];

        // Лек | Лаб | Прак
        const pairType = td.lastChild.textContent.split(' ')[1];
        const span = td.childNodes[0];

        let spanLinksCounter = 0;

        // Iterating span for getting discipline links data
        for (let k = 0; k < span.childNodes.length; k++) {
          const element = span.childNodes[k];
          if (element instanceof dom.window.Text) continue;
          localRowPairs[spanLinksCounter] = {
            name: element.textContent,
            tag: pairType,
            day,
            week,
            time,
            group,
          };
          spanLinksCounter += 1;
        }

        let linksCounter = 0;

        // Filter junk
        const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/igm;
        const teacherLinks = Object.values(td.childNodes).filter((n: any) => !(n instanceof dom.window.HTMLBRElement || n instanceof dom.window.Text || n instanceof dom.window.HTMLSpanElement || n.href.match(domainRegex)?.includes('http://maps.google.com')));

        for (let k = 0; k < teacherLinks.length; k++) {
          const anchor = teacherLinks[k] as HTMLAnchorElement;
          const teacherString = anchor.getAttribute('title').split(' ');
          const parseTeacherName = (str) => ({
            lastName: str[str.length - 1 - 2].replace('.', '') ?? '',
            firstName: str[str.length - 1 - 1].replace('.', '') ?? '',
            middleName: str[str.length - 1 - 0].replace('.', '') ?? '',
          });
          // Previous and last teacher bind to the last discipline
          if (teacherLinks.length > localRowPairs.length && k === teacherLinks.length - 1 - 1) {
            const nextAnchor = teacherLinks[k + 1] as HTMLAnchorElement;
            const mainTeacher = parseTeacherName(teacherString);
            const secondaryTeacher = parseTeacherName(nextAnchor.getAttribute('title').split(' '));
            const teachers = [mainTeacher, secondaryTeacher];
            localRowPairs[linksCounter].teachers = teachers;
            // Force loop finish
            k += 1;
            continue;
          }
          localRowPairs[linksCounter].teacher = parseTeacherName(teacherString);
          linksCounter += 1;
        }
        pairs.push(...localRowPairs);
      }
    }

    return pairs;
  }

  async getTeacherFullInitials (lastName: string, firstName: string, middleName: string) {
    if (firstName.length <= 1 || middleName.length <= 1) {
      const teachers = await this.teacherRepository.findMany({
        where: { lastName, firstName: { startsWith: firstName }, middleName: { startsWith: middleName } },
      });

      if (teachers.length === 1) return teachers[0];
    }

    // If several teachers with same initials or if there is no such teacher at all
    const teacher = await this.teacherRepository.getOrCreate({
      lastName,
      firstName,
      middleName,
    });
    return teacher;
  }

  async parsePair (pair, groupId: string, period: StudyingSemester) {
    const subject = await this.subjectRepository.getOrCreate(pair.name ?? '');
    const name = DISCIPLINE_TYPE[pair.tag] ?? DISCIPLINE_TYPE.Лек;
    const role = TEACHER_TYPE[pair.tag] ?? TEACHER_TYPE.Лек;

    const week = pair.week;
    const day = pair.day;
    const { startDate: startOfSemester } = await this.dateService.getSemester(period);
    const [startHours, startMinutes] = pair.time
      .split(':')
      .map((s) => parseInt(s));
    const startOfEvent = new Date(startOfSemester.getTime()+week*WEEK+(day-1)*DAY+startHours*HOUR+startMinutes*MINUTE);
    const endOfEvent = new Date(startOfEvent.getTime()+16*WEEK+HOUR+35*MINUTE);

    let discipline = await this.disciplineRepository.getOrCreate({
      subjectId: subject.id,
      groupId,
      year: period.year,
      semester: period.semester,
    });

    if (!discipline.disciplineTypes.some((type) => type.name === name)) {
      discipline = await this.disciplineRepository.updateById(discipline.id, {
        disciplineTypes: {
          create: {
            name,
          },
        },
      });
    }

    const disciplineType = discipline.disciplineTypes.find((type) => type.name === name);

    const teachers = pair.teachers ? pair.teachers : [{ lastName: '', firstName: '', middleName: '' }];
    for (const { lastName, firstName, middleName } of teachers) {
      const teacher = await this.getTeacherFullInitials(lastName, firstName, middleName);

      const disciplineTeacher =
        await this.disciplineTeacherRepository.getOrCreate({
          teacherId: teacher.id,
          disciplineId: discipline.id,
        });

      await this.disciplineTeacherRoleRepository.getOrCreate({
        role,
        disciplineTeacherId: disciplineTeacher.id,
        disciplineTypeId: disciplineType.id,
      });
    }

    const event = await this.eventRepository.find({
      OR: [
        {
          startTime: startOfEvent,
          groupId: groupId,
          lessons: {
            some: {
              disciplineTypeId: disciplineType.id,
            },
          },
        },
        {
          startTime: new Date(startOfEvent.getTime() - WEEK),
          groupId: groupId,
          lessons: {
            some: {
              disciplineTypeId: disciplineType.id,
            },
          },
        },
      ],
    });

    const weeksCountEveryFortnight = await this.getWeeksCount(startOfEvent, Period.EVERY_FORTNIGHT);
    const weeksCountEveryWeek = await this.getWeeksCount(startOfEvent, Period.EVERY_WEEK);

    if (!event) {
      await this.eventRepository.create({
        name: pair.name,
        startTime: startOfEvent,
        endTime: endOfEvent,
        period: Period.EVERY_FORTNIGHT,
        groupId: groupId,
        lessons: {
          create: {
            disciplineTypeId: disciplineType.id,
          },
        },
        eventInfo: {
          createMany: {
            data: this.getIndexesForEventInfo(0,  weeksCountEveryFortnight - 1),
          },
        },
      });
    } else if (
      event.startTime.getTime() === startOfEvent.getTime() - WEEK &&
      event.period === Period.EVERY_FORTNIGHT
    ) {
      await this.eventRepository.updateById(event.id, {
        period: Period.EVERY_WEEK,
        endTime: endOfEvent,
        eventInfo: {
          createMany: {
            data: this.getIndexesForEventInfo(weeksCountEveryFortnight, weeksCountEveryWeek),
          },
        },
      });
    }
  }

  getIndexesForEventInfo (startIndex: number, endIndex: number) {
    return Array.from({
      length: endIndex - startIndex + 1,
    }, (_, i) => ({
      number: i + startIndex,
    }));
  }

  async getWeeksCount (indexStartDate: Date, period: Period) {
    const { endDate } = await this.dateService.getCurrentSemester();

    const difference = Math.ceil((endDate.getTime() - FORTNITE - indexStartDate.getTime()) / DAY);
    const divider = period === Period.EVERY_FORTNIGHT ? 14 : 7;

    return Math.floor(difference / divider);
  }
}

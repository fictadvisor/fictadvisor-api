import { Injectable } from '@nestjs/common';
import { FileService } from '../../utils/files/FileService';
import { PersonalDataDTO, StudyContractDTO } from '../dtos/StudyContractDTO';
import { StudyTypeParam } from '../dtos/StudyContractParams';
import { ObjectIsRequiredException } from '../../utils/exceptions/ObjectIsRequiredException';
import * as process from 'process';
import { EmailService } from './EmailService';
import { PriorityDTO } from '../dtos/PriorityDTO';
import { EducationProgram, PriorityState } from '@prisma/client';
import { InvalidEducationProgramsException } from '../../utils/exceptions/InvalidEducationProgramsException';
import { EntrantRepository } from '../../database/repositories/EntrantRepository';
import { NoPermissionException } from '../../utils/exceptions/NoPermissionException';

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const EducationPrograms = {
  121: [EducationProgram.CSSE, EducationProgram.ISSE],
  126: [EducationProgram.IIS, EducationProgram.ISRS, EducationProgram.IMST],
};

@Injectable()
export class DocumentService {

  constructor (
    private fileService: FileService,
    private emailService: EmailService,
    private entrantRepository: EntrantRepository,
  ) {}

  private getFullString (...args) {
    return args.filter((a) => a).join(', ');
  }

  private formatPersonalData (data: PersonalDataDTO) {
    return {
      ...data,
      passportData: this.getFullString(data.passportNumber, data.passportInstitute, data.passportDate),
      settlement: this.getFullString(data.region, data.settlement),
      address: this.getFullString(data.address, data.index),
      bigName: data.lastName.toUpperCase(),
    };
  }

  async generateStudyContract (data: StudyContractDTO) {
    if (data.meta.studyType === StudyTypeParam.CONTRACT && !data.meta.paymentType) {
      throw new ObjectIsRequiredException('Payment type');
    }

    const { firstName, middleName,  lastName, ...entrant } = data.entrant;

    const dbEntrant = await this.entrantRepository.getOrCreate({
      firstName,
      middleName,
      lastName,
      specialty: data.meta.speciality,
    });

    if (dbEntrant.entrantData) throw new NoPermissionException();

    await this.entrantRepository.updateById(dbEntrant.id, {
      entrantData: {
        create: {
          ...entrant,
        },
      },
    });

    const obj = {
      entrant: this.formatPersonalData(data.entrant),
      representative: data.representative.firstName ? this.formatPersonalData(data.representative) : {},
    };

    const emails = [data.entrant.email];
    if (data.meta.isToAdmission) emails.push(process.env.ADMISSION_EMAIL);

    const agreementName = `${data.meta.speciality}_${data.meta.studyType}_${data.meta.studyForm}.docx`;
    const agreement = this.fileService.fillTemplate(agreementName, obj);

    const attachments = [{ name: 'Договір про навчання.docx', buffer: agreement, contentType: DOCX }];

    if (data.meta.studyType === StudyTypeParam.CONTRACT) {
      const paymentName = `${data.meta.speciality}_${data.meta.paymentType}_${data.meta.studyForm}.docx`;
      const payment = this.fileService.fillTemplate(paymentName, obj);
      attachments.push({ name: 'Договір про надання платної освітньої послуги.docx', buffer: payment, contentType: DOCX });
    }

    this.emailService.sendWithAttachments({
      to: emails,
      subject: `Договори щодо вступу | ${data.entrant.lastName} ${data.entrant.firstName}`,
      message: 'Документи вкладені у цей лист.',
      attachments,
    });
  }

  private validatePrograms ({ specialty, priorities }: PriorityDTO) {
    const programs = Object.values(priorities);
    const expected = EducationPrograms[specialty];
    if (expected.length !== programs.length || !expected.every((p) => programs.includes(p))) {
      throw new InvalidEducationProgramsException();
    }
  }

  async generatePriority (data: PriorityDTO) {
    this.validatePrograms(data);

    const priorities = [];
    for (const priority in data.priorities) {
      priorities.push({ priority: Number(priority), program: data.priorities[priority] });
    }

    const entrant = await this.entrantRepository.getOrCreate({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      specialty: data.specialty,
    });

    if (entrant.priority) throw new NoPermissionException();

    const day = data.day.padStart(2, '0');
    await this.entrantRepository.updateById(entrant.id, {
      priority: {
        create: {
          state: PriorityState.NOT_APPROVED,
          date: `${day}.08.${new Date().getFullYear()}`,
          priorities: {
            createMany: {
              data: priorities,
            },
          },
        },
      },
    });

    const obj = {};
    priorities.map(({ priority, program }) => obj[program] = priority);

    const priority = this.fileService.fillTemplate(`Пріоритетка_${data.specialty}.docx`, { ...data, day, ...obj });

    const emails = [data.email];
    if (data.isToAdmission) emails.push(process.env.ADMISSION_EMAIL);

    this.emailService.sendWithAttachments({
      to: emails,
      subject: `Пріоритетка | ${data.lastName} ${data.firstName}`,
      message: 'Документ вкладений у цей лист.',
      attachments: [{ name: 'Пріоритетка.docx', buffer: priority, contentType: DOCX }],
    });
  }
}
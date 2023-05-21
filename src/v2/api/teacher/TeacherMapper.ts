import { Injectable } from '@nestjs/common';
import { DbTeacher } from './DbTeacher';
import { TeacherRole } from '@prisma/client';
import { DbQuestionWithDiscipline } from '../poll/DbQuestionWithDiscipline';

@Injectable()
export class TeacherMapper {
  getTeacher (teacher: DbTeacher) {
    return {
      id: teacher.id,
      firstName: teacher.firstName,
      middleName: teacher.middleName,
      lastName: teacher.lastName,
      description: teacher.description,
      avatar: teacher.avatar,
    };
  }

  getAllTeachers (dbTeachers: DbTeacher[]) {
    const teachers = [];
    for (const dbTeacher of dbTeachers) {
      teachers.push(
        this.getTeacher(dbTeacher)
      );
    }
    return { teachers };
  }

  getRoles (teacher: DbTeacher): TeacherRole[] {
    const roles = [];
    for (const disciplineTeacher of teacher.disciplineTeachers) {
      const dbRoles = disciplineTeacher.roles
        .map((r) => r.role)
        .filter((r) => !roles.includes(r));
      roles.push(...dbRoles);
    }
    return roles;
  }

  getTeachersWithRoles (dbTeachers: DbTeacher[]) {
    return dbTeachers.map((dbTeacher) => {
      const { disciplineTeachers, ...teacher } = dbTeacher;
      return {
        ...teacher,
        roles: this.getRoles(dbTeacher),
      };
    });
  }

  getComments (responses: DbQuestionWithDiscipline[]) {
    const comments = { 
      questions: [],
    };
    for (const question of responses) {
      if (question.questionAnswers.length === 0) continue;
      comments.questions.push({
        name: question.name,
        amount: question.questionAnswers.length,
        comments: [],
      });
      for (const answer of question.questionAnswers) {
        comments.questions.at(-1).comments.push({
          discipline: answer.disciplineTeacher.discipline.subject.name,
          semester: answer.disciplineTeacher.discipline.semester,
          year: answer.disciplineTeacher.discipline.year,
          comment: answer.value,
        });
      }
    }
    return comments;
  }
}

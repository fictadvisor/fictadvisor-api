import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import { CreateQuestionsDTO } from './dto/CreateQuestionDTO';
import { QuestionRepository } from './QuestionRepository';
import { UpdateQuestionDTO } from './dto/UpdateQuestionDTO';
import { Question, TeacherRole } from '@prisma/client';
import { DisciplineRepository } from '../discipline/DisciplineRepository';
import { DisciplineTeacherRepository } from '../teacher/DisciplineTeacherRepository';
import { CreateQuestionRoleDTO } from './dto/CreateQuestionRoleDTO';

@Injectable()
export class PollService {
  constructor (
    private prisma: PrismaService,
    private questionRepository: QuestionRepository,

    private disciplineRepository: DisciplineRepository,
    @Inject(forwardRef(() => DisciplineTeacherRepository))
    private disciplineTeacherRepository: DisciplineTeacherRepository,
  ) {}

  async createQuestions (body: CreateQuestionsDTO) {
    const questions = [];
    for (const question of body.questions) {
      questions.push(await this.questionRepository.create(question));
    }
    return {
      questions,
    };
  }

  async delete (id: string) {
    await this.questionRepository.delete(id);
  }

  async update (id: string, body: UpdateQuestionDTO) {
    await this.questionRepository.update(id, body);
  }

  async getQuestion (id: string) {
    return await this.questionRepository.getQuestion(id);
  }

  async giveRole (body: CreateQuestionRoleDTO, questionId: string) {
    return await this.questionRepository.connectRole(questionId, body);
  }

  async deleteRole (questionId: string, role: TeacherRole) {
    return await this.questionRepository.deleteRole(questionId, role);
  }

  async getQuestionsByRoles (roles: TeacherRole[]) {
    const results = [];
    for (const role of roles) {
      const roleQuestions = await this.questionRepository.getQuestionsByRole(role);
      results.push(...roleQuestions);
    }
    return results;
  }

  async getUnifyQuestionByRoles (roles: TeacherRole[]) {
    const questions = await this.getQuestionsByRoles(roles);
    return this.unifyQuestions(questions);
  }

  sortByCategories (questions: Question[]) {
    const results = [];
    for (const question of questions) {
      const name = question.name;
      delete question.category;
      const category = results.find((c) => (c.name === name));
      if (!category) {
        results.push({
          name: name,
          count: 1,
          questions: [question],
        });
      } else {
        category.count++;
        category.questions.push(question);
      }
    }
    return results;
  }

  unifyQuestions (questions: Question[]) {
    const results = [];
    for (const question of questions) {
      if (!results.some((q) => (q.id === question.id))) {
        results.push(question);
      }
    }
    return results;
  }
}

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DisciplineTypeRepository } from './DisciplineTypeRepository';
import { TeacherService } from '../teacher/TeacherService';
import { DisciplineTeacherService } from '../teacher/DisciplineTeacherService';
import { DisciplineRepository } from './DisciplineRepository';
import { DisciplineTeacherRepository } from '../teacher/DisciplineTeacherRepository';

@Injectable()
export class DisciplineTypeService {
  constructor (
    private readonly disciplineTypeRepository: DisciplineTypeRepository,
    private readonly disciplineRepository: DisciplineRepository,
    private readonly disciplineTeacherRepository: DisciplineTeacherRepository,
    @Inject(forwardRef(() => DisciplineTeacherService))
    private readonly disciplineTeachersService: DisciplineTeacherService,
    @Inject(forwardRef(() => TeacherService))
    private readonly teacherService: TeacherService
  ) {}

  async getTeachers (id: string) {
    const roles = await this.disciplineTypeRepository.getDisciplineTeacherRoles(id);
    const results = [];

    for (const role of roles) {
      const teacher = await this.disciplineTeacherRepository.getTeacher(role.disciplineTeacherId);
      results.push({ disciplineTeacherId: role.disciplineTeacherId, roles: [role.role], ...teacher });
    }

    return results;
  }

  async getGroup (id: string) {
    const discipline = await this.disciplineTypeRepository.getDiscipline(id);
    return await this.disciplineRepository.getGroup(discipline.id);
  }

  async deleteDisciplineTeachers (id: string) {
    const roles = await this.disciplineTypeRepository.getDisciplineTeacherRoles(id);
    for (const role of roles) {
      await this.disciplineTeacherRepository.delete(role.disciplineTeacherId);
    }
  }
}

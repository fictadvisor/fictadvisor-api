import { Injectable, PipeTransform } from '@nestjs/common';
import { InvalidEntityIdException } from 'src/v2/utils/exceptions/InvalidEntityIdException';
import { TeacherRepository } from '../TeacherRepository';

@Injectable()
export class TeacherByIdPipe implements PipeTransform<string, Promise<string>> {
  constructor (
    private teacherRepository: TeacherRepository
  ) {}

  async transform (teacherId: string): Promise<string> {
    const teacher = await this.teacherRepository.getTeacher(teacherId);
    if (!teacher) {
      throw new InvalidEntityIdException('teacher');
    }
    return teacherId;
  }
}
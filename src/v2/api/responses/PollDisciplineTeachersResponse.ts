import { ApiProperty } from '@nestjs/swagger';
import { TeacherRole } from '@prisma/client';

class Subject {

  @ApiProperty()
    id: string;

  @ApiProperty()
    name: string;
}

class DisciplineTeachers {

  @ApiProperty()
    disciplineTeacherId: string;

  @ApiProperty({
    type: [TeacherRole],
    enum: TeacherRole,
  })
    roles: TeacherRole[];

  @ApiProperty()
    firstName: string;

  @ApiProperty()
    middleName: string;

  @ApiProperty()
    lastName: string;

  @ApiProperty()
    avatar: string;

  @ApiProperty()
    subject: Subject;
}

export class PollDisciplineTeachersResponse {

  @ApiProperty({
    description: 'Id of teacher of poll`s discipline',
  })
    hasSelectedInLastSemester:boolean;

  @ApiProperty({
    type: [DisciplineTeachers],
    description: 'Id of discipline',
  })
    teachers: DisciplineTeachers[];
}
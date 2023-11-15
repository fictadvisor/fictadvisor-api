import { ApiProperty } from '@nestjs/swagger';
import { TeacherRole } from '@prisma/client';

export class ShortTeacherResponse {
  @ApiProperty({
    description: 'Id of specified teacher',
  })
    id: string;

  @ApiProperty({
    description: 'Teacher\'s first name',
  })
    firstName: string;

  @ApiProperty({
    description: 'Teacher\'s middle name',
  })
    middleName: string;

  @ApiProperty({
    description: 'Teacher\'s last name',
  })
    lastName: string;
}

export class TeacherResponse extends ShortTeacherResponse {
  @ApiProperty({
    description: 'Some description of the teacher',
  })
    description: string;

  @ApiProperty({
    description: 'Link to teacher avatar image',
  })
    avatar: string;

  @ApiProperty({
    description: 'Teacher rating according to the poll, updated at 00:00 (UTC)',
  })
    rating: number;
}

export class ExtendTeacherResponse extends TeacherResponse {
  @ApiProperty({
    description: 'Teacher\'s id',
  })
    disciplineTeacherId: string;

  @ApiProperty({
    type: [TeacherRole],
    enum: TeacherRole,
    description: 'List of teacher\'s roles',
  })
    roles: TeacherRole[];
}

import { ApiProperty } from '@nestjs/swagger';
import { CreateQuestionRoleDTO } from '../dtos/CreateQuestionRoleDTO';
import { QuestionResponse } from './QuestionResponse';

export class QuestionWithRolesResponse extends QuestionResponse {
  @ApiProperty({
    description: 'Id of question`s role'
  })
    order: number;

  @ApiProperty({
    type: [CreateQuestionRoleDTO],
    description: 'Teacher`s role',
  })
    roles: CreateQuestionRoleDTO[];
}
import { Body, Controller, Delete, Get, Patch, Param, Post } from '@nestjs/common';
import { PollService } from '../services/PollService';
import { CreateQuestionWithRolesDTO } from '../dtos/CreateQuestionWithRolesDTO';
import { Access } from 'src/v2/security/Access';
import { PERMISSION } from '../../security/PERMISSION';
import { QuestionByIdPipe } from '../pipes/QuestionByIdPipe';
import { QuestionByRoleAndIdPipe } from '../pipes/QuestionByRoleAndIdPipe';
import { UserByIdPipe } from '../pipes/UserByIdPipe';
import { QuestionMapper } from '../../mappers/QuestionMapper';
import { UpdateQuestionWithRolesDTO } from '../dtos/UpdateQuestionWithRolesDTO';
import { CreateQuestionRoleDTO } from '../dtos/CreateQuestionRoleDTO';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { QuestionWithRolesResponse } from '../responses/QuestionWithRolesResponse';
import { PollDisciplineTeachersResponse } from '../responses/PollDisciplineTeachersResponse';
import { TeacherRole } from '@prisma/client';
import { ApiEndpoint } from 'src/v2/utils/documentation/decorators';

@ApiTags('Poll')
@Controller({
  version: '2',
  path: '/poll',
})
export class PollController {
  constructor (
    private pollService: PollService,
    private questionMapper: QuestionMapper,
  ) {}

  @Access(PERMISSION.QUESTIONS_CREATE)
  @ApiBearerAuth()
  @Post('/questions')
  @ApiOkResponse({
    type: QuestionWithRolesResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidBodyException:
      Visibility must be boolean
      Visibility can not be empty
      Requirement must be boolean
      Requirement can not be empty`,
  })
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiForbiddenResponse({
    description: `\n
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  async create (
    @Body() body : CreateQuestionWithRolesDTO,
  ) {
    const question = await this.pollService.create(body);
    return this.questionMapper.getQuestionWithRoles(question);
  }

  @Access(PERMISSION.USERS_$USERID_POLL_TEACHERS_GET)
  @ApiBearerAuth()
  @Get('/teachers/:userId')
  @ApiOkResponse({
    type: PollDisciplineTeachersResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException:
      User with such id is not found`,
  })
  @ApiForbiddenResponse({
    description: `\n
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  async getPollDisciplineTeachers (
    @Param('userId', UserByIdPipe) userId: string,
  ): Promise<PollDisciplineTeachersResponse> {
    return this.pollService.getDisciplineTeachers(userId);
  }

  @Access(PERMISSION.QUESTIONS_DELETE)
  @ApiBearerAuth()
  @Delete('/questions/:questionId')
  @ApiOkResponse({
    type: QuestionWithRolesResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException:
      Question with such id is not found`,
  })
  @ApiForbiddenResponse({
    description: `\n
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  async delete (
    @Param('questionId', QuestionByIdPipe) questionId: string,
  ) {
    const question = await this.pollService.deleteById(questionId);
    return this.questionMapper.getQuestionWithRoles(question);
  }

  @Access(PERMISSION.QUESTIONS_UPDATE)
  @ApiBearerAuth()
  @Patch('/questions/:questionId')
  @ApiOkResponse({
    type: QuestionWithRolesResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidBodyException:
      Type must be enum

    InvalidEntityIdException:
      Question with such id is not found`,
  })
  @ApiForbiddenResponse({
    description: `\n
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  async update (
    @Param('questionId', QuestionByIdPipe) questionId: string,
    @Body() body: UpdateQuestionWithRolesDTO,
  ) {
    const question = await this.pollService.updateById(questionId, body);
    return this.questionMapper.getQuestionWithRoles(question);
  }

  @Get('/questions/:questionId')
  @ApiOkResponse({
    type: QuestionWithRolesResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException:
      question with such id is not found`,
  })
  async getQuestion (
    @Param('questionId', QuestionByIdPipe) questionId: string,
  ) {
    const question = await this.pollService.getQuestionById(questionId);
    return this.questionMapper.getQuestionWithRoles(question);
  }

  @Access(PERMISSION.QUESTIONS_ROLES_GIVE)
  @ApiBearerAuth()
  @Post('/questions/:questionId/roles')
  @ApiOkResponse({
    type: QuestionWithRolesResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidBodyException: 
      Role can not be empty

    InvalidBodyException: 
      Visibility must be boolean

    InvalidBodyException:
      Visibility can not be empty

    InvalidBodyException:
      Requirement must be boolean

    InvalidEntityIdException:
      Question with such id is not found`,
  })
  @ApiForbiddenResponse({
    description: `\n
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  async giveRole (
    @Param('questionId', QuestionByIdPipe) questionId: string,
    @Body() body: CreateQuestionRoleDTO,
  ) {
    const question = await this.pollService.giveRole(body, questionId);
    return this.questionMapper.getQuestionWithRoles(question);
  }

  @Access(PERMISSION.QUESTIONS_ROLES_DELETE)
  @ApiBearerAuth()
  @Delete('/questions/:questionId/roles/:role')
  @ApiParam({
    name: 'role',
    enum: [TeacherRole.LECTURER, TeacherRole.LABORANT, TeacherRole.PRACTICIAN],
    required: true,
  })
  @ApiParam({
    name: 'questionId',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: QuestionWithRolesResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException:
      Question with such id is not found
      QuestionRole was not found`,
  })
  @ApiForbiddenResponse({
    description: `\n
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  async deleteRole (
    @Param(QuestionByRoleAndIdPipe) params,
  ) {
    const question = await this.pollService.deleteRole(params.questionId, params.role);
    return this.questionMapper.getQuestionWithRoles(question);
  }

}
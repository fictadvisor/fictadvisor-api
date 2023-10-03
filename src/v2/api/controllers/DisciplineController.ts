import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DisciplineService } from '../services/DisciplineService';
import { CreateDisciplineDTO } from '../dtos/CreateDisciplineDTO';
import { GroupByDisciplineGuard } from '../../security/group-guard/GroupByDisciplineGuard';
import { Access } from 'src/v2/security/Access';
import { PERMISSION } from '../../security/PERMISSION';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DisciplineByIdPipe } from '../pipes/DisciplineByIdPipe';
import { DisciplineTeachersResponse } from '../responses/DisciplineTeachersResponse';
import { DisciplineTypeEnum } from '@prisma/client';
import { DisciplineResponse } from '../responses/DisciplineResponse';

@ApiTags('Discipline')
@Controller({
  version: '2',
  path: '/disciplines',
})
export class DisciplineController {
  constructor (
    private disciplineService: DisciplineService,
  ) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    type: DisciplineResponse,
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
  @Access(PERMISSION.GROUPS_$GROUPID_DISCIPLINES_CREATE)
  @Post()
  create (
    @Body() body: CreateDisciplineDTO,
  ) {
    return this.disciplineService.create(body);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: DisciplineTeachersResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidQueryException:
      Type of discipline must be a field of enum
    InvalidDisciplineIdException:
      Discipline with such id is not found`,
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
  @ApiParam({
    name: 'disciplineId',
    required: true,
    description: 'Id of certain discipline',
  })
  @ApiQuery({
    name: 'disciplineType',
    required: true,
    enum: DisciplineTypeEnum,
    description: 'Discipline type of some discipline',
  })
  @Access(PERMISSION.GROUPS_$GROUPID_DISCIPLINES_TEACHERS_GET, GroupByDisciplineGuard)
  @Get('/:disciplineId/teachers')
  async getAllByDiscipline (
    @Param('disciplineId', DisciplineByIdPipe) disciplineId: string,
    @Query('disciplineType') disciplineType: DisciplineTypeEnum,
  ) {
    const teachers = await this.disciplineService.getTeachers(disciplineId, disciplineType);
    return { teachers };
  }
}

import { Body, Controller, Delete, Get, Param, Post, Query, Patch } from '@nestjs/common';
import { TeacherService } from '../services/TeacherService';
import { TeacherMapper } from '../../mappers/TeacherMapper';
import { QueryAllTeacherDTO } from '../dtos/QueryAllTeacherDTO';
import { CreateTeacherDTO } from '../dtos/CreateTeacherDTO';
import { UpdateTeacherDTO } from '../dtos/UpdateTeacherDTO';
import { CreateContactDTO } from '../dtos/CreateContactDTO';
import { UpdateContactDTO } from '../dtos/UpdateContactDTO';
import { Access } from 'src/v2/security/Access';
import { TeacherByIdPipe } from '../pipes/TeacherByIdPipe';
import { ContactByNamePipe } from '../pipes/ContactByNamePipe';
import { SubjectByIdPipe } from '../pipes/SubjectByIdPipe';
import { ResponseQueryDTO } from '../dtos/ResponseQueryDTO';
import { PollService } from '../services/PollService';
import { QuestionMapper } from '../../mappers/QuestionMapper';
import { DisciplineTeacherMapper } from '../../mappers/DisciplineTeacherMapper';
import { UserByIdPipe } from '../pipes/UserByIdPipe';
import { CommentsQueryDTO } from '../dtos/CommentsQueryDTO';
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TeachersWithRatingResponse } from '../responses/TeachersWithRatingResponse';
import { CathedraByIdPipe } from '../pipes/CathedraByIdPipe';
import { TeacherWithRolesAndContactsResponse } from '../responses/TeacherWithRolesAndContactsResponse';
import { TeacherWithContactsResponse } from '../responses/TeacherWithContactsResponse';
import { TeacherWithSubjectResponse } from '../responses/TeacherWithSubjectResponse';

@ApiTags('Teachers')
@Controller({
  version: '2',
  path: '/teachers',
})
export class TeacherController {
  constructor (
    private teacherService: TeacherService,
    private teacherMapper: TeacherMapper,
    private pollService: PollService,
    private questionMapper: QuestionMapper,
    private disciplineTeacherMapper: DisciplineTeacherMapper,
  ) {}


  @Get()
  @ApiOkResponse({
    type: TeachersWithRatingResponse,
  })
  @ApiBadRequestResponse({
    description: `InvalidQueryException:\n
                  Page must be a number
                  PageSize must be a number
                  Wrong value for order`,
  })
  async getAll (
    @Query() query: QueryAllTeacherDTO,
  ) {
    const teachers = await this.teacherService.getAllTeachersWithRating(query);
    return { teachers };
  }

  @Get('/:teacherId/roles')
  async getTeacherRoles (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
  ) {
    const roles = await this.teacherService.getTeacherRoles(teacherId);

    return { roles };
  }

  @Get('/:teacherId/subjects')
  async getSubjects (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
  ) {
    const subjects = await this.teacherService.getTeacherSubjects(teacherId);

    return { subjects };
  }

  @Access('users.$userId.teachers.$teacherId.disciplines.get')
  @Get('/:teacherId/disciplines')
  async getDisciplines (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
    @Query('notAnswered') notAnswered: boolean,
    @Query('userId', UserByIdPipe) userId: string,
  ) {
    const disciplineTeachers = await this.teacherService.getUserDisciplineTeachers(teacherId, userId, notAnswered);
    return this.disciplineTeacherMapper.getDisciplines(disciplineTeachers);
  }

  @Get('/:teacherId/subjects/:subjectId')
  @ApiOkResponse({
    type: TeacherWithSubjectResponse,
  })
  @ApiBadRequestResponse({
    description: `InvalidEntityIdException:\n
                  Teacher with such id is not found
                  Subject with such id is not found`,
  })
  async getSubject (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
    @Param('subjectId', SubjectByIdPipe) subjectId: string,
  ) {
    return this.teacherService.getTeacherSubject(teacherId, subjectId);
  }

  @Get('/:teacherId')
  @ApiOkResponse({
    type: TeacherWithContactsResponse,
  })
  @ApiBadRequestResponse({
    description: `InvalidEntityIdException:\n
                  teacher with such id is not found`,
  })
  getTeacher (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
  ) {
    return this.teacherService.getTeacher(teacherId);
  }

  @Access('teachers.create')
  @Post()
  async create (
    @Body() body: CreateTeacherDTO,
  ) {
    const dbTeacher = await this.teacherService.create(body);
    return this.teacherMapper.getTeacher(dbTeacher);
  }

  @Access('teachers.$teacherId.update')
  @Patch('/:teacherId')
  async update (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
    @Body() body: UpdateTeacherDTO,
  ) {
    const dbTeacher = await this.teacherService.update(teacherId, body);
    return this.teacherMapper.getTeacher(dbTeacher);
  }

  @Access('teachers.$teacherId.delete')
  @Delete('/:teacherId')
  async delete (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
  ) {
    return this.teacherService.delete(teacherId);
  }

  @Get('/:teacherId/contacts')
  async getAllContacts (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
  ) {
    const contacts = await this.teacherService.getAllContacts(teacherId);
    return { contacts };
  }

  @Get('/:teacherId/contacts/:name')
  getContact (
    @Param(ContactByNamePipe) params: {teacherId: string, name: string},
  ) {
    return this.teacherService.getContact(params.teacherId, params.name);
  }

  @Access('teachers.$teacherId.contacts.create')
  @Post('/:teacherId/contacts')
  createContact (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
    @Body() body: CreateContactDTO,
  ) {
    return this.teacherService.createContact(teacherId, body);
  }

  @Access('teachers.$teacherId.contacts.update')
  @Patch('/:teacherId/contacts/:name')
  async updateContact (
    @Param(ContactByNamePipe) params: {teacherId: string, name: string},
    @Body() body: UpdateContactDTO,
  ) {
    return this.teacherService.updateContact(params.teacherId, params.name, body);
  }

  @Access('teachers.$teacherId.contacts.delete')
  @Delete('/:teacherId/contacts/:name')
  async deleteContact (
    @Param(ContactByNamePipe) params: {teacherId: string, name: string},
  ) {
    return this.teacherService.deleteContact(params.teacherId, params.name);
  }

  @Get('/:teacherId/marks')
  async getMarks (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
    @Query() query: ResponseQueryDTO,
  ) {
    const marks = await this.teacherService.getMarks(teacherId, query);
    return { marks };
  }

  @Get('/:teacherId/comments')
  async getComments (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
    @Query() query: CommentsQueryDTO,
  ) {
    this.teacherService.checkQueryDate(query);
    const questions = await this.pollService.getQuestionWithText(teacherId, query);
    return this.questionMapper.getQuestionWithResponses(questions);
  }

  @Access('teachers.$teacherId.cathedrae.update')
  @ApiBearerAuth()
  @Patch('/:teacherId/cathedra/:cathedraId')
  @ApiOkResponse({
    type: TeacherWithRolesAndContactsResponse,
  })
  @ApiBadRequestResponse({
    description: `InvalidEntityIdException:\n
                  teacher with such id is not found
                  cathedra with such id is not found`,
  })
  @ApiForbiddenResponse({
    description: `NoPermissionException:\n
                  You do not have permission to perform this action`,
  })
  async connectCathedra (
    @Param('teacherId', TeacherByIdPipe) teacherId: string,
    @Param('cathedraId', CathedraByIdPipe) cathedraId: string,
  ) {
    return this.teacherService.connectTeacherWithCathedra(teacherId, cathedraId);
  }
}

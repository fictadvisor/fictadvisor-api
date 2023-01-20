import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SubjectService } from './SubjectService';
import { GetDTO } from '../teacher/dto/GetDTO';
import { CreateSubjectDTO } from './dto/CreateSubjectDTO';
import { SubjectByIdPipe } from './SubjectByIdPipe';
import { Subject } from '@prisma/client';

@Controller({
  version: '2',
  path: '/subjects',
})
export class SubjectController {
  constructor(
    private subjectService: SubjectService,
  ) {}

  @Get()
  getAll(@Query() body: GetDTO<Subject>) {
    return this.subjectService.getAll(body);
  }

  @Get('/:id')
  get(@Param('id', SubjectByIdPipe) subject: Subject) {
    return subject;
  }

  @Post()
  create(@Body() body: CreateSubjectDTO) {
    return this.subjectService.create(body);
  }
}
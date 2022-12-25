import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TeacherService } from './TeacherService';
import { GetDTO } from './dto/GetDTO';
import { CreateTeacherDTO } from './dto/CreateTeacherDTO';

@Controller({
  version: '2',
  path: '/teachers'
})
export class TeacherController {
  constructor(
    private teacherService: TeacherService,
  ) {}

  @Get()
  async getAll(@Body() body: GetDTO) {
    return this.teacherService.getAll(body);
  }

  @Post()
  async create(@Body() body: CreateTeacherDTO) {
    return this.teacherService.create(body);
  }

  @Get('/:id')
  async get(@Param('id') id: string) {
    return this.teacherService.get(id);
  }
}
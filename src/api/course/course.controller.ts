import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseDto } from './dto/course.dto';
import { Authorize } from '../../security/security.authorization';
import { Context, SecurityContext } from '../../security/security.context';
import { CourseAddDto } from './dto/course-add.dto';
import { CourseUpdateDto } from './dto/course-update.dto';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('/:link')
  getCourse(@Param('link') link: string): Promise<CourseDto> {
    return this.courseService.getCourseByLink(link);
  }

  @Authorize()
  @Post()
  addCourse(
    @Context() ctx: SecurityContext,
    @Body() course: CourseAddDto
  ): Promise<CourseDto> {
    return this.courseService.addCourse(course, ctx.user);
  }

  @Authorize({ telegram: true })
  @Put('/:id')
  updateCourse(
    @Param('id') id: string,
    @Body() body: CourseUpdateDto
  ): Promise<CourseDto> {
    return this.courseService.updateCourse(id, body);
  }

  @Authorize({ telegram: true })
  @Delete('/:id')
  deleteCourse(@Param('id') id: string): Promise<void> {
    return this.courseService.deleteCourse(id);
  }
}

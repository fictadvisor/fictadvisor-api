import { Expose } from 'class-transformer';
import { CourseSearchIndex } from '../../../database/entities/course-search-index.entity';
import { assign } from '../../../common/common.object';
import { CourseTeacherItemDto } from './course-teacher-item.dto';
import { CourseState } from 'src/database/entities/course.entity';

export class CourseItemDto {
  id: string;

  link: string;

  teacher: CourseTeacherItemDto;

  @Expose({ name: 'review_count' })
  reviewCount: number;

  rating: number;

  state: CourseState;

  recommended: boolean;

  public static from(v: CourseSearchIndex): CourseItemDto {
    const teacher = assign(new CourseTeacherItemDto(), {
      id: v.teacherId,
      link: v.link,
      firstName: v.teacherFirstName,
      lastName: v.teacherLastName,
      middleName: v.teacherMiddleName,
    });

    return assign(new CourseItemDto(), {
      id: v.id,
      link: v.link,
      state: v.state,
      teacher,
      reviewCount: v.reviewCount,
      rating: v.rating,
      recommended: v.recommended,
    });
  }
}

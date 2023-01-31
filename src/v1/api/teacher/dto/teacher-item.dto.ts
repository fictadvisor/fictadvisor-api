import { Expose } from 'class-transformer';
import { assign } from 'src/v1/common/common.object';
import { type TeacherSearchIndex } from 'src/v1/database/entities/teacher-search-index.entity';
import { type TeacherState } from 'src/v1/database/entities/teacher.entity';

export class TeacherItemDto {
  id: string;

  link: string;

  @Expose({ name: 'full_name' })
    fullName: string;

  @Expose({ name: 'first_name' })
    firstName: string;

  @Expose({ name: 'middle_name' })
    middleName?: string;

  @Expose({ name: 'last_name' })
    lastName?: string;

  state: TeacherState;

  rating: number;

  public static from (e: TeacherSearchIndex) {
    return assign(new TeacherItemDto(), {
      id: e.id,
      link: e.link,
      firstName: e.firstName,
      middleName: e.middleName,
      lastName: e.lastName,
      state: e.state,
      rating: e.rating,
    });
  }
}

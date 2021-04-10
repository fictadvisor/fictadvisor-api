import { Expose } from "class-transformer";
import { assign } from "src/common/common.object";
import { Course } from "src/database/entities/course.entity";
import { CourseTeacherDto } from "./course-teacher.dto";

export class CourseDto {
    id: string;

    link: string;

    teacher: CourseTeacherDto;

    name: string;

    rating: number;

    description: string;

    @Expose({ name: 'created_at' })
    createdAt: Date;

    @Expose({ name: 'updated_at' })
    updatedAt: Date;

    public static from(c: Course) {
        return assign(
            new CourseDto(),
            {
                id: c.id,
                link: c.link,
                teacher: CourseTeacherDto.from(c.teacher),
                name: c.subject.name,
                rating: null,
                description: c.description,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            }
        );
    }
};
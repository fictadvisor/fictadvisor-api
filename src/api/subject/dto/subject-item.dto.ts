import { Expose } from "class-transformer";
import { SubjectSearchIndex } from "../../../database/entities/subject-search-index";
import { assign } from "../../../common/common.object";

export class SubjectItemDto {
    id: string;

    link: string;

    name: string;

    description?: string

    @Expose({ name: 'teacher_count' })
    teacherCount: number

    rating: number

    public static from(i: SubjectSearchIndex): SubjectItemDto {
        return assign(
            new SubjectItemDto(),
            {
                id: i.id,
                link: i.link,
                name: i.name,
                description: i.description,
                teacherCount: i.teacherCount,
                rating: i.rating
            }
        )
    }
}

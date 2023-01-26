import { IsEmpty, MaxLength, MinLength } from "class-validator";

export class UpdateSubjectDTO {
  @MinLength(5, {
    message: 'name is too short (min: 5)',
  })
  @MaxLength(150, {
    message: 'name is too long (max: 150)',
  })
  @IsEmpty({
    message: 'name can not be empty',
  })
  name: string;
}
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class CreateSubjectDTO {
  @MinLength(5, {
    message: 'name is too short (min: 5)',
  })
  @MaxLength(150, {
    message: 'name is too long (max: 150)',
  })
  @IsNotEmpty({
    message: 'name can not be empty',
  })
  name: string;
}
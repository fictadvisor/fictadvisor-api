import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RemainingSelectiveDTO {
  @ApiProperty({
    description: 'The certain year of the selective discipline',
  })
  @Type(() => Number)
  @IsNumber({}, {
    message: 'year must be a number',
  })
    year: number;

  @ApiProperty({
    description: 'The certain semester of the selective discipline',
  })
  @Type(() => Number)
  @IsNumber({}, {
    message: 'semester must be a number',
  })
    semester: number;
}
import { IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemainingSelectiveDTO {
    @ApiProperty()
    @IsNumberString({}, {
      message: 'year must be a number',
    })
      year: number;

    @ApiProperty()
    @IsNumberString({}, {
      message: 'semester must be a number',
    })
      semester: number;
}
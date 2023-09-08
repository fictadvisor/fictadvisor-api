import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { validationOptionsMsg } from '../../utils/GLOBALS';

export class SwitchCaptainDTO {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty(validationOptionsMsg('Captain id cannot be empty'))
    studentId: string;
}
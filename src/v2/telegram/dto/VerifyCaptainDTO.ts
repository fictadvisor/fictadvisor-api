import { IsNotEmpty, IsNumber } from 'class-validator';
import { validationOptionsMsg } from '../../utils/GLOBALS';

export class VerifyCaptainDTO {
  @IsNotEmpty(validationOptionsMsg('id can not be empty'))
    id: string;

  @IsNumber()
    telegramId: number;

  @IsNotEmpty(validationOptionsMsg('firstName can not be empty'))
    firstName: string;

  @IsNotEmpty(validationOptionsMsg('middleName can not be empty'))
    middleName: string;

  @IsNotEmpty(validationOptionsMsg('lastName can not be empty'))
    lastName: string;

  @IsNotEmpty(validationOptionsMsg('groupCode can not be empty'))
    groupCode: string;
}
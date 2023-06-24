import { IsAscii, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';
import {
  createRegex,
  ENG_REGEX,
  NUM_REGEX,
  UKR_REGEX,
  UKRSPEC_REGEX,
  validationOptionsMsg,
} from '../../utils/GLOBALS';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDTO {
    @ApiProperty()
    @MaxLength(100, validationOptionsMsg('Name is too long (max: 100)'))
    @IsNotEmpty(validationOptionsMsg('Name can not be empty'))
    @Matches(
      createRegex(UKR_REGEX, ENG_REGEX, NUM_REGEX, UKRSPEC_REGEX),
      validationOptionsMsg('Name is not correct (a-zA-Z0-9A-Я(укр.)\\-\' )'),
    )
      name: string;

    @ApiProperty()
    @MaxLength(100, validationOptionsMsg('Display name is too long (max: 100)'))
    @IsNotEmpty(validationOptionsMsg('Display name can not be empty'))
      displayName: string;

    @ApiPropertyOptional()
    @MaxLength(200, validationOptionsMsg('Link is too long (max: 200)'))
    @IsAscii(validationOptionsMsg('Link contains wrong symbols (ASCII only)'))
    @IsOptional()
      link?: string;
}
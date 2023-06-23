import { ApiProperty } from '@nestjs/swagger';

class Semester {
  @ApiProperty()
    year: number;

  @ApiProperty()
    semester: number;

  @ApiProperty()
    startDate: Date;

  @ApiProperty()
    endDate: Date;
}

export class SemestersResponse {
  @ApiProperty({
    type: [Semester],
  })
    semesters: Semester[];
}

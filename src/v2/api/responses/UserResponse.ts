import { ApiProperty } from '@nestjs/swagger';
import { State } from '@prisma/client';

export class ShortUserResponse {
  @ApiProperty()
    id: string;

  @ApiProperty()
    email: string;
}

export class UserResponse extends ShortUserResponse {
  @ApiProperty()
    username: string;

  @ApiProperty()
    telegramId?: number;

  @ApiProperty()
    avatar: string;

  @ApiProperty({
    enum: State,
  })
    state: State;
}

export class ShortUsersResponse {
  @ApiProperty({
    type: [ShortUserResponse],
  })
    users: ShortUserResponse[];
}

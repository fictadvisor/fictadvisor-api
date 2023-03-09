import { Role, State } from '@prisma/client';

export class StudentWithUserData {
  user: {
    id: string,
    username: string,
    email: string,
    telegramId: number,
    avatar: string,
  };
  firstName: string;
  middleName: string;
  lastName: string;
  state: State;
  group: {
    id: string,
    code: string,
  };
  roles: {
    role: Role,
  }[];
}
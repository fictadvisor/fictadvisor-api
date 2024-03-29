import { HttpException, HttpStatus } from '@nestjs/common';

export class ActionGroupForbiddenException extends HttpException {
  constructor () {
    super('You do not have the right to perform actions with this group', HttpStatus.FORBIDDEN);
  }
}
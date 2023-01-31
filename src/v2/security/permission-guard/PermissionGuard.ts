import { type CanActivate, type ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../../api/user/UserService';
import { type Request } from 'express';
import { Reflector } from '@nestjs/core';
import { type User } from '@prisma/client';
import { NoPermissionException } from '../../utils/exceptions/NoPermissionException';
import { RequestUtils } from '../../utils/RequestUtils';

@Injectable()
export class PermissionGuard implements CanActivate {
  private request: Request;

  protected constructor (
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly reflector: Reflector
  ) {
    this.userService = userService;
    this.reflector = reflector;
  }

  async canActivate (context: ExecutionContext) {
    this.request = context.switchToHttp().getRequest<Request>();
    const user: User = this.request.user as User;
    const permission = this.getPermission(context);
    const hasPermission = await this.userService.hasPermission(user.id, permission);

    if (!hasPermission) {
      throw new NoPermissionException();
    }

    return true;
  }

  getPermission (context: ExecutionContext): string {
    const permission: string = this.reflector.get('permission', context.getHandler());
    return permission
      .split('.')
      .map((part) => this.getPart(part))
      .join('.');
  }

  getPart (part: string): string {
    if (part.startsWith('$')) {
      const newPart = RequestUtils.get(this.request, part.slice(1));
      if (!newPart) {
        throw new NoPermissionException();
      }
      return newPart;
    }

    return part;
  }
}

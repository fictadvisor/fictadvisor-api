import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';

export class SecurityContext {
  user?: User;
}

export const Context = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SecurityContext => {
    const req = ctx.switchToHttp().getRequest();
    const context = new SecurityContext();

    context.user = req.user ?? null;

    return context;
  }
);

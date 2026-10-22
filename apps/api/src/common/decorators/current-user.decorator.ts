import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserPayload } from '@ca-career-os/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

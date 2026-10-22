import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from '@ca-career-os/shared';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { membership } = context.switchToHttp().getRequest();
    if (!membership) {
      throw new ForbiddenException(
        'Workspace membership context missing. WorkspaceGuard must precede RolesGuard.'
      );
    }

    const hasRole = requiredRoles.includes(membership.memberRole);
    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient workspace permissions. Required: [${requiredRoles.join(
          ', '
        )}], Current: ${membership.memberRole}`
      );
    }

    return true;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service.js';
import { WorkspaceService } from '../../modules/workspace/workspace.service.js';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceService: WorkspaceService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('User context missing. JwtAuthGuard must precede WorkspaceGuard.');
    }

    const workspaceId =
      (req.headers['x-workspace-id'] as string) ||
      req.params?.workspaceId ||
      req.body?.workspaceId;

    if (!workspaceId) {
      throw new BadRequestException('Workspace identifier (x-workspace-id) is required');
    }

    // Mandatory WorkspaceService resolution enforces strict tenant isolation in both DB and memory modes
    const ws = await this.workspaceService.getWorkspaceById(workspaceId, user.id);
    req.workspace = ws;
    req.membership = {
      workspaceId: ws.id,
      userId: user.id,
      memberRole: ws.role,
    };
    return true;
  }
}

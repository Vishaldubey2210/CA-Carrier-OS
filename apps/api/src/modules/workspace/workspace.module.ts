import { Global, Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller.js';
import { WorkspaceService } from './workspace.service.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Global()
@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceGuard, RolesGuard],
  exports: [WorkspaceService, WorkspaceGuard, RolesGuard],
})
export class WorkspaceModule {}


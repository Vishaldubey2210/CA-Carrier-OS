import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';

@Module({
  imports: [WorkspaceModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}


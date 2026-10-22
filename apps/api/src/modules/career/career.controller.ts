import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CareerService } from './career.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import {
  AuthUserPayload,
  CandidateProfileInput,
  GenerateRoadmapInput,
  UpdateTaskStatusInput,
  WorkspaceSummary,
} from '@ca-career-os/shared';

@Controller('api/v1/career')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Get('profile')
  async getProfile(
    @CurrentUser() user: AuthUserPayload,
    @CurrentWorkspace() workspace: WorkspaceSummary
  ) {
    return await this.careerService.getProfile(user.id, workspace.id);
  }

  @Post('profile')
  @HttpCode(HttpStatus.OK)
  async saveProfile(
    @CurrentUser() user: AuthUserPayload,
    @CurrentWorkspace() workspace: WorkspaceSummary,
    @Body() body: CandidateProfileInput
  ) {
    return await this.careerService.saveProfile(user.id, workspace.id, body);
  }

  @Post('diagnostic')
  @HttpCode(HttpStatus.OK)
  async runDiagnostic(
    @CurrentUser() user: AuthUserPayload,
    @CurrentWorkspace() workspace: WorkspaceSummary
  ) {
    return await this.careerService.runDiagnostic(user.id, workspace.id);
  }

  @Get('roadmap')
  async getRoadmap(
    @CurrentUser() user: AuthUserPayload,
    @CurrentWorkspace() workspace: WorkspaceSummary
  ) {
    return await this.careerService.getRoadmap(user.id, workspace.id);
  }

  @Post('roadmap/generate')
  @HttpCode(HttpStatus.CREATED)
  async generateRoadmap(
    @CurrentUser() user: AuthUserPayload,
    @CurrentWorkspace() workspace: WorkspaceSummary,
    @Body() body: GenerateRoadmapInput
  ) {
    return await this.careerService.generateRoadmap(user.id, workspace.id, body.targetPathway);
  }

  @Patch('tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  async updateTaskStatus(
    @CurrentUser() user: AuthUserPayload,
    @CurrentWorkspace() workspace: WorkspaceSummary,
    @Param('taskId') taskId: string,
    @Body() body: UpdateTaskStatusInput
  ) {
    return await this.careerService.updateTaskStatus(user.id, workspace.id, taskId, body.status);
  }
}

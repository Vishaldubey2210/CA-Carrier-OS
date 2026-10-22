import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateApplicationInputType,
  CreateApplicationSchema,
  CreateFollowUpTaskInputType,
  CreateFollowUpTaskSchema,
  UpdateApplicationStatusInputType,
  UpdateApplicationStatusSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { ApplicationsService } from './applications.service.js';

@Controller('api/v1/applications')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * List applications for authenticated candidate in personal workspace
   */
  @Get()
  async listApplications(
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const apps = await this.applicationsService.listApplications(user.id, workspace.id);
    return createSuccessResponse(apps);
  }

  /**
   * Create an application tracking record
   */
  @Post()
  async createApplication(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parseResult = CreateApplicationSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for application tracking creation',
        errors: parseResult.error.errors,
      });
    }
    const app = await this.applicationsService.createApplication(
      parseResult.data,
      user.id,
      workspace.id
    );
    return createSuccessResponse(app);
  }

  /**
   * Get application detail with status history and follow-up tasks
   */
  @Get(':id')
  async getApplicationById(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const app = await this.applicationsService.getApplicationById(id, user.id);
    return createSuccessResponse(app);
  }

  /**
   * Transition application status
   */
  @Patch(':id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parseResult = UpdateApplicationStatusSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for application status update',
        errors: parseResult.error.errors,
      });
    }
    const updated = await this.applicationsService.updateApplicationStatus(
      id,
      parseResult.data,
      user.id
    );
    return createSuccessResponse(updated);
  }

  /**
   * Add a follow-up task
   */
  @Post(':id/follow-ups')
  async addFollowUpTask(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parseResult = CreateFollowUpTaskSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for follow-up task creation',
        errors: parseResult.error.errors,
      });
    }
    const task = await this.applicationsService.addFollowUpTask(id, parseResult.data, user.id);
    return createSuccessResponse(task);
  }

  /**
   * Toggle follow-up task completion
   */
  @Patch(':id/follow-ups/:taskId')
  async toggleFollowUpTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: { completed?: boolean },
    @CurrentUser() user: any
  ) {
    const completed = body?.completed ?? true;
    const task = await this.applicationsService.toggleFollowUpTask(
      id,
      taskId,
      completed,
      user.id
    );
    return createSuccessResponse(task);
  }
}

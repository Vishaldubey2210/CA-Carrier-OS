import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  CreatePracticeClientSchema,
  CreatePracticeComplianceTaskSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { PracticeService } from './practice.service.js';

@Controller('api/v1/practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  // =========================================================================
  // Post-Qualification Guidance
  // =========================================================================

  @Get('post-qualification/checklist')
  @UseGuards(JwtAuthGuard)
  async getPostQualificationChecklist(@CurrentUser() user: any) {
    const list = await this.practiceService.getPostQualificationChecklist(user.id);
    return createSuccessResponse(list);
  }

  @Post('post-qualification/checklist/:taskKey/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleChecklistTask(
    @Param('taskKey') taskKey: string,
    @Body() body: { isCompleted: boolean; notes?: string },
    @CurrentUser() user: any
  ) {
    if (typeof body?.isCompleted !== 'boolean') {
      throw new BadRequestException('isCompleted (boolean) is required');
    }
    const item = await this.practiceService.toggleChecklistTask(
      user.id,
      taskKey,
      body.isCompleted,
      body.notes
    );
    return createSuccessResponse(item);
  }

  // =========================================================================
  // Independent Practice Management CRM (Firm Workspaces)
  // =========================================================================

  @Post('clients')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async createClient(
    @Body() body: unknown,
    @CurrentWorkspace() workspace: any
  ) {
    const parse = CreatePracticeClientSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid practice client data',
        errors: parse.error.errors,
      });
    }

    const client = await this.practiceService.createClient(parse.data, workspace.id);
    return createSuccessResponse(client);
  }

  @Get('clients')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listClients(@CurrentWorkspace() workspace: any) {
    const clients = await this.practiceService.listClients(workspace.id);
    return createSuccessResponse(clients);
  }

  @Get('clients/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async getClient(
    @Param('id') id: string,
    @CurrentWorkspace() workspace: any
  ) {
    const client = await this.practiceService.getClientById(id, workspace.id);
    return createSuccessResponse(client);
  }

  @Post('tasks')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async createComplianceTask(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parse = CreatePracticeComplianceTaskSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid compliance task payload',
        errors: parse.error.errors,
      });
    }

    const task = await this.practiceService.createComplianceTask(
      parse.data,
      workspace.id,
      user.id
    );
    return createSuccessResponse(task);
  }

  @Get('tasks')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listComplianceTasks(
    @CurrentWorkspace() workspace: any,
    @Query('category') category?: string,
    @Query('status') status?: string
  ) {
    const tasks = await this.practiceService.listComplianceTasks(
      workspace.id,
      category,
      status
    );
    return createSuccessResponse(tasks);
  }

  @Patch('tasks/:id/status')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() body: { status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW_PENDING' | 'FILED' | 'OVERDUE'; filedReferenceNo?: string },
    @CurrentWorkspace() workspace: any
  ) {
    if (!body?.status) {
      throw new BadRequestException('status is required');
    }
    const updated = await this.practiceService.updateTaskStatus(
      id,
      body.status,
      body.filedReferenceNo,
      workspace.id
    );
    return createSuccessResponse(updated);
  }
}

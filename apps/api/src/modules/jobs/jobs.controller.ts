import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateJobInput,
  CreateJobSchema,
  JobFilterQueryInput,
  JobFilterQuerySchema,
  JobIngestInputType,
  JobIngestSchema,
  SaveJobNoteSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { JobsService } from './jobs.service.js';
import { JobAlertsService } from './job-alerts.service.js';
import { CareerService } from '../career/career.service.js';

@Controller('api/v1/jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly careerService: CareerService,
    private readonly jobAlertsService: JobAlertsService
  ) {}

  /**
   * Search and list jobs with optional candidate match scoring
   */
  @Get()
  async listJobs(
    @Query() query: Record<string, string>,
    @Req() req: any
  ) {
    const parseResult = JobFilterQuerySchema.safeParse(query);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Invalid job query parameters',
        errors: parseResult.error.errors,
      });
    }

    const userId = req.user?.id;
    const workspaceId = req.workspace?.id;

    let profile;
    if (userId && workspaceId) {
      try {
        profile = await this.careerService.getProfile(userId, workspaceId);
      } catch {
        // Fall back gracefully if user has not initialized profile
      }
    }

    const result = await this.jobsService.listJobs(parseResult.data, profile, userId);
    return createSuccessResponse(result.jobs, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  }

  /**
   * List saved jobs for the authenticated user
   */
  @Get('saved')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listSavedJobs(@CurrentUser() user: any) {
    const saved = await this.jobsService.listSavedJobs(user.id);
    return createSuccessResponse(saved);
  }

  /**
   * Get job alert preferences for authenticated candidate
   */
  @Get('alerts/preferences')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async getAlertPreferences(@CurrentUser() user: any) {
    const prefs = await this.jobAlertsService.getPreferences(user.id);
    return createSuccessResponse(prefs);
  }

  /**
   * Update job alert preferences
   */
  @Post('alerts/preferences')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async saveAlertPreferences(@Body() body: unknown, @CurrentUser() user: any) {
    const prefs = await this.jobAlertsService.savePreferences(user.id, body);
    return createSuccessResponse(prefs);
  }

  /**
   * Process and dispatch pending job alerts for authenticated candidate
   */
  @Post('alerts/process')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async processJobAlerts(@CurrentUser() user: any) {
    const query = JobFilterQuerySchema.parse({});
    const all = await this.jobsService.listJobs(query, undefined, user.id);
    const result = await this.jobAlertsService.processJobAlerts(user.id, user.email, all.jobs);
    return createSuccessResponse(result);
  }

  /**
   * Direct employer job publication
   */
  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async publishJob(
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parseResult = CreateJobSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for job publication',
        errors: parseResult.error.errors,
      });
    }
    const job = await this.jobsService.publishJob(parseResult.data, user.id);
    return createSuccessResponse(job);
  }

  /**
   * Job ingestion pipeline
   */
  @Post('ingest')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async ingestJobs(@Body() body: unknown) {
    const parseResult = JobIngestSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for job ingestion payload',
        errors: parseResult.error.errors,
      });
    }
    const result = await this.jobsService.ingestJobs(parseResult.data);
    return createSuccessResponse(result);
  }

  /**
   * Get job by ID with candidate match score
   */
  @Get(':id')
  async getJobById(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    const workspaceId = req.workspace?.id;

    let profile;
    if (userId && workspaceId) {
      try {
        profile = await this.careerService.getProfile(userId, workspaceId);
      } catch {
        // Fallback
      }
    }

    const job = await this.jobsService.getJobById(id, profile, userId);
    return createSuccessResponse(job);
  }

  /**
   * Get explainable match report against candidate profile
   */
  @Get(':id/match')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async getJobMatch(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const profile = await this.careerService.getProfile(user.id, workspace.id);
    const report = await this.jobsService.getJobMatch(id, profile);
    return createSuccessResponse(report);
  }

  /**
   * Save a job for candidate
   */
  @Post(':id/save')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async saveJob(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parseResult = SaveJobNoteSchema.safeParse(body || {});
    const notes = parseResult.success ? parseResult.data.notes : undefined;
    const saved = await this.jobsService.saveJob(id, user.id, notes);
    return createSuccessResponse(saved);
  }

  /**
   * Unsave a job
   */
  @Delete(':id/save')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async unsaveJob(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const result = await this.jobsService.unsaveJob(id, user.id);
    return createSuccessResponse(result);
  }
}

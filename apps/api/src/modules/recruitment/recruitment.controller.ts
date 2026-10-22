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
  EmployerVerificationRequestSchema,
  UpdateRecruitmentPipelineStageSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { RecruitmentService } from './recruitment.service.js';

@Controller('api/v1/recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // =========================================================================
  // Public Employer Intelligence
  // =========================================================================

  @Get('employers')
  async listEmployers(
    @Query('industry') industry?: string,
    @Query('firmTier') firmTier?: string
  ) {
    const list = await this.recruitmentService.listEmployers(industry, firmTier);
    return createSuccessResponse(list);
  }

  @Get('employers/:idOrSlug')
  async getEmployer(@Param('idOrSlug') idOrSlug: string) {
    const profile = await this.recruitmentService.getEmployerProfile(idOrSlug);
    return createSuccessResponse(profile);
  }

  // =========================================================================
  // Employer Verification Workflow
  // =========================================================================

  @Post('employers/:id/verify-request')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async requestVerification(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parse = EmployerVerificationRequestSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid employer verification request',
        errors: parse.error.errors,
      });
    }

    const req = await this.recruitmentService.requestVerification(id, user.id, parse.data);
    return createSuccessResponse(req);
  }

  @Get('admin/verification-requests')
  @UseGuards(JwtAuthGuard)
  async listVerificationRequests(@Query('status') status?: string) {
    const list = await this.recruitmentService.listVerificationRequests(status);
    return createSuccessResponse(list);
  }

  @Post('admin/verification-requests/:id/review')
  @UseGuards(JwtAuthGuard)
  async reviewVerificationRequest(
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED'; notes?: string },
    @CurrentUser() user: any
  ) {
    if (!body?.decision || !['APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED'].includes(body.decision)) {
      throw new BadRequestException('Valid decision is required (APPROVED, REJECTED, MORE_INFO_REQUIRED)');
    }

    const updated = await this.recruitmentService.reviewVerificationRequest(
      id,
      user.id,
      body.decision,
      body.notes
    );
    return createSuccessResponse(updated);
  }

  // =========================================================================
  // Recruiter Organization Jobs & Pipeline
  // =========================================================================

  @Get('jobs')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listOrganizationJobs(@CurrentWorkspace() workspace: any) {
    const jobs = await this.recruitmentService.listOrganizationJobs(workspace.id);
    return createSuccessResponse(jobs);
  }

  @Get('jobs/:jobId/applicants')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listJobApplicants(
    @Param('jobId') jobId: string,
    @CurrentWorkspace() workspace: any
  ) {
    const applicants = await this.recruitmentService.listJobApplicants(jobId, workspace.id);
    return createSuccessResponse(applicants);
  }

  @Patch('applications/:applicationId/stage')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async updatePipelineStage(
    @Param('applicationId') applicationId: string,
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parse = UpdateRecruitmentPipelineStageSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid pipeline stage update payload',
        errors: parse.error.errors,
      });
    }

    const review = await this.recruitmentService.updateApplicantPipelineStage(
      applicationId,
      workspace.id,
      user.id,
      parse.data
    );
    return createSuccessResponse(review);
  }

  // =========================================================================
  // Recruiter Candidate Discovery & Audit Logs
  // =========================================================================

  @Get('candidate-discovery')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async searchCandidates(
    @Query('pathway') pathway?: string,
    @Query('city') city?: string,
    @Query('query') query?: string,
    @CurrentUser() user?: any,
    @CurrentWorkspace() workspace?: any
  ) {
    const results = await this.recruitmentService.searchCandidates(
      { pathway, city, query },
      workspace.id,
      user.id
    );
    return createSuccessResponse(results);
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  getAuditLogs(@CurrentWorkspace() workspace: any) {
    const logs = this.recruitmentService.getAuditLogs(workspace.id);
    return createSuccessResponse(logs);
  }
}

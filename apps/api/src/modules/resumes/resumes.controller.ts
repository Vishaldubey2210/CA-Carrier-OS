import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AttestResumeSchema,
  CreatePortfolioEntryInput,
  CreatePortfolioEntrySchema,
  CreateResumeInput,
  CreateResumeSchema,
  DraftCoverLetterInput,
  DraftCoverLetterSchema,
  TailorResumeInputType,
  TailorResumeSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { ResumesService } from './resumes.service.js';
import { DocumentIntelligenceService } from './document-intelligence.service.js';
import { DocumentUploadInput } from '@ca-career-os/shared';

@Controller('api/v1/resumes')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly documentService: DocumentIntelligenceService
  ) {}

  /**
   * List resume summaries for candidate
   */
  @Get()
  async listResumes(
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const resumes = await this.resumesService.listResumes(user.id, workspace.id, user);
    return createSuccessResponse(resumes);
  }

  /**
   * Create master resume from candidate profile
   */
  @Post()
  async createResume(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parseResult = CreateResumeSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for resume creation',
        errors: parseResult.error.errors,
      });
    }
    const resume = await this.resumesService.createResume(
      parseResult.data,
      user.id,
      workspace.id,
      user
    );
    return createSuccessResponse(resume);
  }

  /**
   * Tailor resume for target job (ADR-009 Zero-Fabrication Guard)
   */
  @Post('tailor')
  async tailorResume(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parseResult = TailorResumeSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for resume tailoring',
        errors: parseResult.error.errors,
      });
    }
    const tailored = await this.resumesService.tailorResume(
      parseResult.data,
      user.id,
      workspace.id
    );
    return createSuccessResponse(tailored);
  }

  /**
   * Attest resume version claims
   */
  @Post('versions/:versionId/attest')
  async attestResume(
    @Param('versionId') versionId: string,
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parseResult = AttestResumeSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Candidate must explicitly attest all claims before export',
        errors: parseResult.error.errors,
      });
    }
    const attested = await this.resumesService.attestResume(versionId, user.id);
    return createSuccessResponse(attested);
  }

  /**
   * Draft job-specific cover letter or recruiter outreach message
   */
  @Post('draft-letter')
  async draftCoverLetter(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parseResult = DraftCoverLetterSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for cover letter drafting',
        errors: parseResult.error.errors,
      });
    }
    const letter = await this.resumesService.draftCoverLetter(
      parseResult.data,
      user.id,
      workspace.id,
      user
    );
    return createSuccessResponse(letter);
  }

  /**
   * List portfolio entries
   */
  @Get('portfolio')
  async listPortfolioEntries(@CurrentUser() user: any) {
    const items = await this.resumesService.listPortfolioEntries(user.id);
    return createSuccessResponse(items);
  }

  /**
   * Create portfolio entry
   */
  @Post('portfolio')
  async createPortfolioEntry(
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parseResult = CreatePortfolioEntrySchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for portfolio entry creation',
        errors: parseResult.error.errors,
      });
    }
    const entry = await this.resumesService.createPortfolioEntry(parseResult.data, user.id);
    return createSuccessResponse(entry);
  }

  /**
   * Export resume as markdown or downloadable text
   */
  @Get(':id/export')
  async exportResume(
    @Param('id') id: string,
    @Query('versionId') versionId: string | undefined,
    @Query('format') format: 'markdown' | 'json' | 'text' | undefined,
    @CurrentUser() user: any,
    @Res() res: Response
  ) {
    const result = await this.resumesService.exportResume(
      id,
      versionId,
      format || 'markdown',
      user.id,
      user
    );
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="resume-${id}.md"`);
    return res.send(result.content);
  }

  /**
   * Get single resume with full version history
   */
  @Get(':id')
  async getResumeById(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const resume = await this.resumesService.getResumeById(id, user.id);
    return createSuccessResponse(resume);
  }

  /**
   * Upload and process candidate document (e.g. Form 108 Articleship Completion) via OCR
   */
  @Post('upload-document')
  async uploadDocument(
    @Body() body: DocumentUploadInput,
    @CurrentUser() user: any
  ) {
    const result = await this.documentService.processDocument(body);
    return createSuccessResponse(result);
  }
}

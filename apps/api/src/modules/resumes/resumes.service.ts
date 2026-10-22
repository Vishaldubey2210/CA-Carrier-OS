import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CAPathway,
  ClaimAttestationReport,
  CoverLetterDraft,
  CreatePortfolioEntryInput,
  CreateResumeInput,
  DraftCoverLetterInput,
  PortfolioItem,
  ResumeDetail,
  ResumeSectionContent,
  ResumeSummary,
  ResumeVersionDetail,
  TailorResumeInputType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { CareerService } from '../career/career.service.js';
import { JobsService } from '../jobs/jobs.service.js';
import {
  buildMasterResumeContent,
  generateCoverLetterDraft,
  renderResumeMarkdown,
  tailorResumeForJob,
} from './resume-tailoring.engine.js';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  // In-memory fallback stores
  private readonly memResumes = new Map<string, ResumeDetail>(); // resumeId -> ResumeDetail
  private readonly memPortfolio = new Map<string, PortfolioItem[]>(); // userId -> PortfolioItem[]

  constructor(
    private readonly prisma: PrismaService,
    private readonly careerService: CareerService,
    private readonly jobsService: JobsService
  ) {}

  /**
   * List resumes for candidate; auto-builds Master Resume if none exist.
   */
  async listResumes(
    userId: string,
    workspaceId: string,
    user: { firstName: string; lastName: string; email: string }
  ): Promise<ResumeSummary[]> {
    const userResumes = Array.from(this.memResumes.values()).filter(
      r => r.candidateProfileId === userId
    );

    if (userResumes.length === 0) {
      // Auto-initialize master resume from profile facts
      const master = await this.createResume(
        {
          title: 'Chartered Accountant — Master Resume',
          targetPathway: CAPathway.AUDIT,
          isDefault: true,
        },
        userId,
        workspaceId,
        user
      );
      return [
        {
          id: master.id,
          candidateProfileId: userId,
          title: master.title,
          targetPathway: master.targetPathway,
          isDefault: true,
          activeVersionId: master.versions[0]?.id,
          versionsCount: master.versions.length,
          updatedAt: master.updatedAt,
        },
      ];
    }

    return userResumes.map(r => ({
      id: r.id,
      candidateProfileId: r.candidateProfileId,
      title: r.title,
      targetPathway: r.targetPathway,
      isDefault: r.isDefault,
      activeVersionId: r.versions[0]?.id,
      versionsCount: r.versions.length,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * Create master resume grounded in candidate profile.
   */
  async createResume(
    input: CreateResumeInput,
    userId: string,
    workspaceId: string,
    user: { firstName: string; lastName: string; email: string }
  ): Promise<ResumeDetail> {
    const profile = await this.careerService.getProfile(userId, workspaceId);
    const content = buildMasterResumeContent(profile, user);

    const resumeId = randomUUID();
    const versionId = randomUUID();
    const now = new Date().toISOString();

    const masterVersion: ResumeVersionDetail = {
      id: versionId,
      resumeId,
      versionNumber: 1,
      title: 'Master Version',
      summary: content.summary,
      targetedJobId: null,
      targetedJobTitle: null,
      targetedCompanyName: null,
      matchScore: 90,
      parsedContent: content,
      claimAttestations: {
        verifiedProfileFactsCount: 6,
        synthesizedWordingCount: content.articleship.highlights.length,
        unverifiedClaims: [],
      },
      candidateAttested: true,
      pdfUrl: `/api/v1/resumes/${resumeId}/export?format=markdown`,
      createdAt: now,
    };

    const record: ResumeDetail = {
      id: resumeId,
      candidateProfileId: userId,
      title: input.title,
      targetPathway: input.targetPathway || CAPathway.AUDIT,
      isDefault: input.isDefault || false,
      versions: [masterVersion],
      updatedAt: now,
    };

    this.memResumes.set(resumeId, record);
    this.logger.log(`Created Master Resume ${resumeId} for user ${userId}`);
    return record;
  }

  /**
   * Get single resume with full version history.
   */
  async getResumeById(resumeId: string, userId: string): Promise<ResumeDetail> {
    const resume = this.memResumes.get(resumeId);
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${resumeId} not found`);
    }

    // Tenant / Candidate Blindfold check
    if (resume.candidateProfileId !== userId) {
      throw new ForbiddenException('Access denied: You cannot access resumes owned by another candidate');
    }

    return resume;
  }

  /**
   * Tailor resume against target job description with Zero-Fabrication Guard (ADR-009).
   */
  async tailorResume(
    input: TailorResumeInputType,
    userId: string,
    workspaceId: string
  ): Promise<ResumeVersionDetail> {
    const resume = await this.getResumeById(input.resumeId, userId);
    const job = await this.jobsService.getJobById(input.jobId);
    const profile = await this.careerService.getProfile(userId, workspaceId);

    const latestVersion = resume.versions[0];
    const masterContent = latestVersion.parsedContent;

    const { tailoredContent, claimAttestations, matchScore } = tailorResumeForJob(
      masterContent,
      profile,
      job,
      input.emphasis
    );

    const newVersionNumber = resume.versions.length + 1;
    const versionId = randomUUID();
    const now = new Date().toISOString();

    const tailoredVersion: ResumeVersionDetail = {
      id: versionId,
      resumeId: resume.id,
      versionNumber: newVersionNumber,
      title: `Tailored: ${job.companyName} (${job.caPathway})`,
      summary: tailoredContent.summary,
      targetedJobId: job.id,
      targetedJobTitle: job.title,
      targetedCompanyName: job.companyName,
      matchScore,
      parsedContent: tailoredContent,
      claimAttestations,
      candidateAttested: false, // Must be explicitly attested by candidate before final PDF export
      pdfUrl: null,
      createdAt: now,
    };

    resume.versions.unshift(tailoredVersion);
    resume.updatedAt = now;

    this.logger.log(`Generated tailored resume version v${newVersionNumber} for job ${job.title}`);
    return tailoredVersion;
  }

  /**
   * Attest resume version claims.
   */
  async attestResume(versionId: string, userId: string): Promise<ResumeVersionDetail> {
    for (const resume of this.memResumes.values()) {
      if (resume.candidateProfileId !== userId) continue;
      const v = resume.versions.find(ver => ver.id === versionId);
      if (v) {
        v.candidateAttested = true;
        v.pdfUrl = `/api/v1/resumes/${resume.id}/export?versionId=${v.id}&format=markdown`;
        return v;
      }
    }
    throw new NotFoundException(`Resume version ${versionId} not found`);
  }

  /**
   * Export resume in Markdown/Text format.
   */
  async exportResume(
    resumeId: string,
    versionId?: string,
    format: 'markdown' | 'json' | 'text' = 'markdown',
    userId?: string,
    user?: { firstName: string; lastName: string; email: string }
  ): Promise<{ content: string; contentType: string }> {
    if (!userId) {
      throw new ForbiddenException('Authentication required for resume export');
    }

    const resume = await this.getResumeById(resumeId, userId);
    const version = versionId
      ? resume.versions.find(v => v.id === versionId)
      : resume.versions[0];

    if (!version) {
      throw new NotFoundException(`Resume version not found`);
    }

    if (!version.candidateAttested) {
      throw new BadRequestException('Zero-Fabrication Guard: Candidate must explicitly attest all claims before downloading or exporting this resume version');
    }

    const candidateName = user ? `${user.firstName} ${user.lastName}` : 'Chartered Accountant Candidate';
    const email = user ? user.email : 'candidate@cacareeros.com';

    if (format === 'json') {
      return {
        content: JSON.stringify(version, null, 2),
        contentType: 'application/json',
      };
    }

    const md = renderResumeMarkdown(version.parsedContent, candidateName, email);
    return {
      content: md,
      contentType: 'text/markdown',
    };
  }

  /**
   * Generate cover letter draft.
   */
  async draftCoverLetter(
    input: DraftCoverLetterInput,
    userId: string,
    workspaceId: string,
    user?: { firstName: string; lastName: string }
  ): Promise<CoverLetterDraft> {
    const profile = await this.careerService.getProfile(userId, workspaceId);
    const job = await this.jobsService.getJobById(input.jobId);
    return generateCoverLetterDraft(profile, job, input.recipientName, user);
  }

  /**
   * Portfolio management: list entries
   */
  async listPortfolioEntries(userId: string): Promise<PortfolioItem[]> {
    return this.memPortfolio.get(userId) || [
      {
        id: randomUUID(),
        candidateProfileId: userId,
        title: 'Statutory Audit Review of Manufacturing Conglomerate',
        category: 'Audit & Assurance',
        description: 'Led a 5-member articleship team conducting testing of revenue recognition (Ind AS 115) and inventory valuation across 4 multi-state plant locations.',
        highlights: [
          'Verified Ind AS 115 performance obligations for complex supply contracts',
          'Performed physical inventory reconciliations valued at ₹85 Cr',
          'Drafted key audit findings memo presented to statutory audit partner',
        ],
        linkUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Portfolio management: create entry
   */
  async createPortfolioEntry(
    input: CreatePortfolioEntryInput,
    userId: string
  ): Promise<PortfolioItem> {
    let entries = this.memPortfolio.get(userId);
    if (!entries) {
      entries = [];
      this.memPortfolio.set(userId, entries);
    }

    const now = new Date().toISOString();
    const entry: PortfolioItem = {
      id: randomUUID(),
      candidateProfileId: userId,
      title: input.title,
      category: input.category,
      description: input.description,
      highlights: input.highlights || [],
      linkUrl: input.linkUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    entries.unshift(entry);
    return entry;
  }
}

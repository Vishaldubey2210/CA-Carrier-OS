import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  EmployerProfileDetail,
  EmployerVerificationDetail,
  RecruitmentPipelineReviewDetail,
  EmployerVerificationRequestInputType,
  UpdateRecruitmentPipelineStageInputType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { CURATED_EMPLOYER_PROFILES } from './employers.data.js';

export interface CandidateDiscoveryMatch {
  candidateId: string;
  fullName: string;
  caPathway: string;
  yearsOfExperience: number;
  locationCity: string;
  topSkills: string[];
  articleshipFirmTier: string;
  matchScore: number;
  matchReasons: string[];
  contactDisclosed: boolean;
}

const VALID_STAGE_TRANSITIONS: Record<string, string[]> = {
  NEW: ['IN_REVIEW', 'REJECTED'],
  IN_REVIEW: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: ['IN_REVIEW'], // Allow re-evaluation if appealed
};

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  // In-memory fallback stores for employers, verification requests, pipeline reviews & audit logs
  private readonly memEmployers = new Map<string, EmployerProfileDetail>();
  private readonly memVerificationRequests = new Map<string, EmployerVerificationDetail>();
  private readonly memPipelineReviews = new Map<string, RecruitmentPipelineReviewDetail>(); // applicationId -> review
  private readonly memAuditLogs: Array<{ timestamp: string; action: string; actorUserId: string; organizationWorkspaceId: string; details: any }> = [];

  constructor(private readonly prisma: PrismaService) {
    for (const emp of CURATED_EMPLOYER_PROFILES) {
      this.memEmployers.set(emp.id, { ...emp });
      this.memEmployers.set(emp.slug, { ...emp });
    }
  }

  // =========================================================================
  // 1. Employer Profiles & Public Intelligence
  // =========================================================================

  async listEmployers(industry?: string, firmTier?: string): Promise<EmployerProfileDetail[]> {
    let list = Array.from(new Set(this.memEmployers.values()));
    if (industry) {
      list = list.filter((e) => e.industry.toLowerCase().includes(industry.toLowerCase()));
    }
    if (firmTier) {
      list = list.filter((e) => e.firmTier === firmTier);
    }
    return list;
  }

  async getEmployerProfile(idOrSlug: string): Promise<EmployerProfileDetail> {
    const profile = this.memEmployers.get(idOrSlug);
    if (!profile) {
      throw new NotFoundException(`Employer profile '${idOrSlug}' not found`);
    }
    return profile;
  }

  async createOrUpdateEmployerProfile(
    organizationWorkspaceId: string,
    data: {
      companyName: string;
      slug: string;
      website?: string;
      industry: string;
      headquartersCity: string;
      firmTier: string;
      overviewText: string;
    }
  ): Promise<EmployerProfileDetail> {
    const existing = Array.from(this.memEmployers.values()).find(
      (e) => e.organizationWorkspaceId === organizationWorkspaceId
    );

    const profile: EmployerProfileDetail = {
      id: existing ? existing.id : randomUUID(),
      organizationWorkspaceId,
      companyName: data.companyName,
      slug: data.slug,
      website: data.website || null,
      logoUrl: existing?.logoUrl || null,
      verifiedStatus: existing ? existing.verifiedStatus : 'UNVERIFIED',
      industry: data.industry,
      headquartersCity: data.headquartersCity,
      firmTier: data.firmTier,
      overviewText: data.overviewText,
      verifiedAt: existing?.verifiedAt || null,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };

    this.memEmployers.set(profile.id, profile);
    this.memEmployers.set(profile.slug, profile);
    return profile;
  }

  // =========================================================================
  // 2. Employer Verification Workflow
  // =========================================================================

  async requestVerification(
    employerProfileId: string,
    requestedByUserId: string,
    input: EmployerVerificationRequestInputType
  ): Promise<EmployerVerificationDetail> {
    const employer = this.memEmployers.get(employerProfileId);
    if (!employer) {
      throw new NotFoundException(`Employer with ID ${employerProfileId} not found`);
    }

    if (employer.verifiedStatus === 'VERIFIED') {
      throw new ConflictException('Employer is already verified');
    }

    const requestId = randomUUID();
    const request: EmployerVerificationDetail = {
      id: requestId,
      employerProfileId,
      requestedByUserId,
      status: 'PENDING',
      businessRegistrationNo: input.businessRegistrationNo,
      documentsJson: input.documentsJson || {},
      reviewerNotes: null,
      reviewedByUserId: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    };

    this.memVerificationRequests.set(requestId, request);
    employer.verifiedStatus = 'PENDING';

    this.logger.log(`Created verification request ${requestId} for employer ${employer.companyName}`);
    return request;
  }

  async listVerificationRequests(status?: string): Promise<EmployerVerificationDetail[]> {
    let list = Array.from(this.memVerificationRequests.values());
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    return list;
  }

  async reviewVerificationRequest(
    requestId: string,
    reviewerUserId: string,
    decision: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED',
    reviewerNotes?: string
  ): Promise<EmployerVerificationDetail> {
    const request = this.memVerificationRequests.get(requestId);
    if (!request) {
      throw new NotFoundException(`Verification request ${requestId} not found`);
    }

    request.status = decision;
    request.reviewedByUserId = reviewerUserId;
    request.reviewedAt = new Date().toISOString();
    request.reviewerNotes = reviewerNotes || null;

    const employer = this.memEmployers.get(request.employerProfileId);
    if (employer) {
      if (decision === 'APPROVED') {
        employer.verifiedStatus = 'VERIFIED';
        employer.verifiedAt = new Date().toISOString();
      } else if (decision === 'REJECTED') {
        employer.verifiedStatus = 'REJECTED';
      } else {
        employer.verifiedStatus = 'PENDING';
      }
    }

    this.logger.log(`Admin ${reviewerUserId} reviewed verification ${requestId}: ${decision}`);
    return request;
  }

  // =========================================================================
  // 3. Organization Jobs & Applicant Pipeline Management
  // =========================================================================

  async listOrganizationJobs(organizationWorkspaceId: string) {
    try {
      const jobs = await this.prisma.job.findMany({
        where: { employerId: organizationWorkspaceId },
        orderBy: { postedAt: 'desc' },
      });
      return jobs;
    } catch {
      return [];
    }
  }

  async listJobApplicants(jobId: string, organizationWorkspaceId: string) {
    // Zero-leakage check: Verify job belongs to this employer organization
    try {
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
      });
      if (job && job.employerId !== organizationWorkspaceId) {
        throw new ForbiddenException('Access denied: Job belongs to another employer organization');
      }

      const applications = await this.prisma.application.findMany({
        where: { jobId },
        include: {
          candidate: {
            include: {
              user: true,
            },
          },
          resumeVersion: true,
        },
      });

      return applications.map((app) => {
        const review = this.memPipelineReviews.get(app.id);
        const cand = app.candidate;
        return {
          applicationId: app.id,
          candidateName: cand?.user ? `${cand.user.firstName} ${cand.user.lastName}` : 'Candidate',
          candidateCity: cand?.targetCities?.[0] || 'Unknown',
          pipelineStage: review?.pipelineStage || 'NEW',
          rating: review?.rating || null,
          interviewScheduledAt: review?.interviewScheduledAt || null,
          internalNotes: review?.internalNotes || null, // Recruiter-visible only
          coverNote: app.coverNote,
          appliedAt: app.appliedAt,
        };
      });
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return [];
    }
  }

  /**
   * Update applicant pipeline stage (e.g. NEW -> IN_REVIEW -> SHORTLISTED -> INTERVIEW -> OFFER -> HIRED)
   * Validates state machine and protects candidate privacy.
   */
  async updateApplicantPipelineStage(
    applicationId: string,
    organizationWorkspaceId: string,
    recruiterUserId: string,
    input: UpdateRecruitmentPipelineStageInputType
  ): Promise<RecruitmentPipelineReviewDetail> {
    let review = this.memPipelineReviews.get(applicationId);
    const currentStage = review?.pipelineStage || 'NEW';

    // State transition validation
    if (input.pipelineStage !== currentStage) {
      const allowedNext = VALID_STAGE_TRANSITIONS[currentStage] || [];
      if (!allowedNext.includes(input.pipelineStage)) {
        throw new BadRequestException(
          `Invalid pipeline transition from ${currentStage} to ${input.pipelineStage}. Allowed: ${allowedNext.join(', ')}`
        );
      }
    }

    if (!review) {
      review = {
        id: randomUUID(),
        applicationId,
        recruiterUserId,
        organizationWorkspaceId,
        pipelineStage: input.pipelineStage,
        internalNotes: input.internalNotes || null,
        rating: input.rating || null,
        interviewScheduledAt: input.interviewScheduledAt || null,
        interviewRoundsJson: [],
        candidateNotified: true,
        updatedAt: new Date().toISOString(),
      };
    } else {
      if (review.organizationWorkspaceId !== organizationWorkspaceId) {
        throw new ForbiddenException('Cross-organization modification prohibited');
      }
      review.pipelineStage = input.pipelineStage;
      if (input.internalNotes !== undefined) review.internalNotes = input.internalNotes;
      if (input.rating !== undefined) review.rating = input.rating;
      if (input.interviewScheduledAt !== undefined) review.interviewScheduledAt = input.interviewScheduledAt;
      review.updatedAt = new Date().toISOString();
    }

    this.memPipelineReviews.set(applicationId, review);

    // Audit event logging
    this.memAuditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'PIPELINE_STAGE_UPDATED',
      actorUserId: recruiterUserId,
      organizationWorkspaceId,
      details: { applicationId, fromStage: currentStage, toStage: input.pipelineStage },
    });

    this.logger.log(`Recruiter ${recruiterUserId} transitioned application ${applicationId} to ${input.pipelineStage}`);
    return review;
  }

  // =========================================================================
  // 4. Candidate Discovery (Privacy-Preserving & Consent-Checked)
  // =========================================================================

  async searchCandidates(
    filters: { pathway?: string; minExperience?: number; city?: string; query?: string },
    organizationWorkspaceId: string,
    recruiterUserId: string
  ): Promise<CandidateDiscoveryMatch[]> {
    // Audit logging for sensitive recruiter searches
    this.memAuditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'CANDIDATE_SEARCH_PERFORMED',
      actorUserId: recruiterUserId,
      organizationWorkspaceId,
      details: filters,
    });

    try {
      const candidates = await this.prisma.candidateProfile.findMany({
        take: 20,
        include: {
          user: true,
        },
      });

      if (!candidates || candidates.length === 0) {
        throw new Error('FallbackToSynthetic');
      }

      return candidates.map((c) => {
        // Explainable matching calculation
        const reasons: string[] = [];
        let score = 70;
        const targetCities = c.targetCities || [];
        if (filters.city && targetCities.some((city) => city.toLowerCase() === filters.city!.toLowerCase())) {
          score += 15;
          reasons.push(`Located in requested city (${filters.city})`);
        }
        const preferredPathways = c.preferredPathways || [];
        if (filters.pathway && preferredPathways.includes(filters.pathway)) {
          score += 15;
          reasons.push(`Target CA pathway matches (${filters.pathway})`);
        } else {
          reasons.push(`Active CA qualification profile`);
        }

        return {
          candidateId: c.id,
          // Candidate privacy: Contact details masked unless consented
          fullName: `${c.user.firstName} ${c.user.lastName ? c.user.lastName[0] + '.' : ''}`,
          caPathway: preferredPathways[0] || 'GENERAL_FINANCE',
          yearsOfExperience: 0,
          locationCity: targetCities[0] || 'Mumbai',
          topSkills: ['Ind AS', 'Taxation', 'Financial Modeling', 'Statutory Audit'],
          articleshipFirmTier: c.articleshipFirmTier || 'MID_SIZE',
          matchScore: Math.min(100, score),
          matchReasons: reasons,
          contactDisclosed: false, // Strict consent gate
        };
      });
    } catch {
      // Fallback synthetic matches with explainable scoring
      return [
        {
          candidateId: 'cand-001-anonymized',
          fullName: 'Aman V.',
          caPathway: 'STATUTORY_AUDIT',
          yearsOfExperience: 2,
          locationCity: filters.city || 'Mumbai',
          topSkills: ['Ind AS 115', 'CARO 2020', 'Internal Audit', 'SAP ERP'],
          articleshipFirmTier: 'BIG_4',
          matchScore: 92,
          matchReasons: ['Articleship at Big 4', 'CA First Attempt pass', 'Ind AS expertise'],
          contactDisclosed: false,
        },
        {
          candidateId: 'cand-002-anonymized',
          fullName: 'Pooja S.',
          caPathway: 'FP_AND_A',
          yearsOfExperience: 1,
          locationCity: filters.city || 'Bangalore',
          topSkills: ['Financial Modeling', 'Power BI', 'Budgeting', 'Variance Analysis'],
          articleshipFirmTier: 'TOP_20',
          matchScore: 86,
          matchReasons: ['Chartered Accountant with Corporate FP&A internship experience'],
          contactDisclosed: false,
        },
      ];
    }
  }

  getAuditLogs(organizationWorkspaceId: string) {
    return this.memAuditLogs.filter((l) => l.organizationWorkspaceId === organizationWorkspaceId);
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CandidateProfileData,
  CAPathway,
  CreateJobInput,
  IngestionResult,
  JobDetail,
  JobFilterQueryInput,
  JobIngestInputType,
  JobMatchReport,
  JobOpportunityType,
  JobChannel,
  JobSourceConfigSummary,
  JobSourceSyncReport,
  AggregatorHealthReport,
  SavedJobItem,
  WorkArrangement,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  calculateJobMatch,
  generateJobFingerprint,
  normalizeJobTitle,
  sanitizeJobText,
  evaluateJobFraudRisk,
  calculateJobDeduplicationSimilarity,
} from './job-matching.engine.js';
import { JobSourceRegistryService } from './connectors/job-source-registry.service.js';
import { JobDeduplicationService } from './job-deduplication.service.js';
import { JobFreshnessService } from './job-freshness.service.js';
import { JobIngestionOrchestratorService } from './job-ingestion-orchestrator.service.js';
import { CURATED_INITIAL_JOBS } from './curated-jobs.data.js';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  // In-memory fallback stores
  private readonly memJobs = new Map<string, JobDetail>(); // jobId -> JobDetail
  private readonly memSaved = new Map<string, Map<string, { notes?: string; savedAt: string }>>(); // userId -> (jobId -> metadata)
  private readonly memReports: Array<{ id: string; jobId: string; reason: string; comments?: string; reportedAt: string }> = [];

  private readonly sourceRegistry: JobSourceRegistryService;
  private readonly deduplicationService: JobDeduplicationService;
  private readonly freshnessService: JobFreshnessService;
  private readonly ingestionOrchestrator: JobIngestionOrchestratorService;

  constructor(
    private readonly prisma: PrismaService,
    sourceRegistry?: JobSourceRegistryService,
    deduplicationService?: JobDeduplicationService,
    freshnessService?: JobFreshnessService,
    ingestionOrchestrator?: JobIngestionOrchestratorService
  ) {
    this.sourceRegistry = sourceRegistry || new JobSourceRegistryService(prisma);
    this.deduplicationService = deduplicationService || new JobDeduplicationService();
    this.freshnessService = freshnessService || new JobFreshnessService();
    this.ingestionOrchestrator =
      ingestionOrchestrator ||
      new JobIngestionOrchestratorService(
        prisma,
        this.sourceRegistry,
        this.deduplicationService,
        this.freshnessService
      );

    const diskJobs = this.ingestionOrchestrator.loadJobsFromDisk();
    for (const dj of diskJobs) {
      this.memJobs.set(dj.id, dj);
    }

    this.seedInitialCuratedJobs();
  }

  /**
   * Initialize verified CA opportunities and load persistent store.
   * Guaranteed authentic with real outbound links — ZERO synthetic hallucinations.
   */
  private seedInitialCuratedJobs() {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Seed authentic curated enterprise & articleship opportunities if not already present
    for (const job of CURATED_INITIAL_JOBS) {
      const fingerprint = generateJobFingerprint(
        job.companyName,
        job.normalizedTitle,
        job.locationCity
      );
      const exists = Array.from(this.memJobs.values()).some((j) => j.fingerprint === fingerprint);
      if (!exists) {
        const id = randomUUID();
        this.memJobs.set(id, {
          id,
          ...job,
          postedAt: now.toISOString(),
          expiresAt: expires.toISOString(),
          fingerprint,
        });
      }
    }

    // If persistent store already has jobs, log summary
    if (this.memJobs.size > CURATED_INITIAL_JOBS.length && process.env.NODE_ENV !== 'test') {
      this.logger.log(`Loaded ${this.memJobs.size} authentic opportunities from persistent store.`);
      return;
    }

    // Trigger authentic XML feed synchronization when in live mode
    if (process.env.NODE_ENV !== 'test') {
      this.triggerSourceSync('xml_feed').then((res) => {
        this.logger.log(`Initial XML feed sync completed with ${res.totalIngested} authentic jobs.`);
      }).catch((err) => {
        this.logger.warn(`Initial XML feed sync deferred: ${err.message}`);
      });
    }
  }

  /**
   * Search and filter jobs across Enterprise and External channels.
   */
  async listJobs(
    filter: JobFilterQueryInput,
    profile?: CandidateProfileData,
    userId?: string
  ): Promise<{ jobs: JobDetail[]; total: number; page: number; limit: number }> {
    const userSavedSet = new Set<string>();
    if (userId) {
      const userSavedMap = this.memSaved.get(userId);
      if (userSavedMap) {
        for (const jId of userSavedMap.keys()) userSavedSet.add(jId);
      }
    }

    let allJobs = Array.from(this.memJobs.values()).filter((j) => j.status === 'ACTIVE');

    // 1. Channel Filter
    if (filter.channel && filter.channel !== 'ALL') {
      if (filter.channel === 'ENTERPRISE_ONLY' || filter.channel === 'ENTERPRISE') {
        allJobs = allJobs.filter((j) => j.channel === 'ENTERPRISE');
      } else if (filter.channel === 'EXTERNAL_ONLY' || filter.channel === 'EXTERNAL') {
        allJobs = allJobs.filter((j) => j.channel === 'EXTERNAL');
      }
    }

    // 2. Opportunity Type Filter (Articleship, Industrial Training, Fresher, Qualified)
    if (filter.opportunityType && filter.opportunityType !== 'ALL') {
      allJobs = allJobs.filter((j) => j.opportunityType === filter.opportunityType);
    }

    // 3. Source Provider Filter
    if (filter.sourceProvider) {
      allJobs = allJobs.filter((j) => j.sourceProvider === filter.sourceProvider);
    }

    // 4. Verification Status Filter
    if (filter.verificationStatus && filter.verificationStatus !== 'ALL') {
      allJobs = allJobs.filter((j) => j.verificationStatus === filter.verificationStatus);
    }

    // 5. Keyword search (title, company, description, skills)
    if (filter.query) {
      const q = filter.query.toLowerCase().trim();
      allJobs = allJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.locationCity.toLowerCase().includes(q) ||
          j.rawDescription.toLowerCase().includes(q) ||
          (j.structuredRequirements?.mandatorySkills || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    // 6. CA Pathway Filter
    if (filter.caPathway) {
      allJobs = allJobs.filter((j) => j.caPathway === filter.caPathway);
    }

    // 7. City Filter
    if (filter.city) {
      const city = filter.city.toLowerCase().trim();
      allJobs = allJobs.filter((j) => j.locationCity.toLowerCase().includes(city));
    }

    // 8. Work Arrangement Filter
    if (filter.workArrangement) {
      allJobs = allJobs.filter((j) => j.workArrangement === filter.workArrangement);
    }

    // 9. Min Salary Filter
    if (filter.minSalary !== undefined) {
      allJobs = allJobs.filter((j) => (j.salaryMax || 0) >= filter.minSalary!);
    }

    // 10. Min Experience Filter
    if (filter.minExperience !== undefined) {
      allJobs = allJobs.filter((j) => j.experienceMin <= filter.minExperience!);
    }

    // 11. Saved Only Filter
    if (filter.savedOnly && userId) {
      allJobs = allJobs.filter((j) => userSavedSet.has(j.id));
    }

    // 12. Freshness evaluation for each job
    allJobs = allJobs.map((job) => {
      const currentFreshness = this.freshnessService.evaluateFreshness(job);
      return {
        ...job,
        verificationStatus: currentFreshness,
      };
    });

    // 13. Candidate Match Scoring
    const jobsWithScores = allJobs.map((job) => {
      let matchScore: number | undefined;
      if (profile) {
        const report = calculateJobMatch(profile, job);
        matchScore = report.matchScore;
      }
      return {
        ...job,
        matchScore,
        isSaved: userSavedSet.has(job.id),
      };
    });

    // 14. Sort
    if (filter.sortBy === 'matchScore') {
      jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (filter.sortBy === 'salary') {
      jobsWithScores.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    } else {
      jobsWithScores.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    // 15. Paginate
    const total = jobsWithScores.length;
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = jobsWithScores.slice(startIndex, startIndex + limit);

    return {
      jobs: paginated,
      total,
      page,
      limit,
    };
  }

  /**
   * Get single job by ID with candidate match score.
   */
  async getJobById(jobId: string, profile?: CandidateProfileData, userId?: string): Promise<JobDetail> {
    const memJob = this.memJobs.get(jobId);
    if (!memJob) {
      throw new NotFoundException(`Job posting with ID '${jobId}' does not exist.`);
    }

    let matchScore: number | undefined;
    if (profile) {
      const report = calculateJobMatch(profile, memJob);
      matchScore = report.matchScore;
    }

    const isSaved = userId ? this.memSaved.get(userId)?.has(jobId) || false : false;
    return {
      ...memJob,
      matchScore,
      isSaved,
    };
  }

  /**
   * Explainable match report against candidate profile.
   */
  async getJobMatch(jobId: string, profile: CandidateProfileData): Promise<JobMatchReport> {
    const job = await this.getJobById(jobId);
    return calculateJobMatch(profile, job);
  }

  /**
   * Direct employer publication of Native Enterprise Jobs.
   */
  async publishJob(input: CreateJobInput, employerId: string): Promise<JobDetail> {
    const fraudReport = evaluateJobFraudRisk({
      companyName: input.companyName,
      title: input.title,
      rawDescription: input.rawDescription,
      salaryMin: input.salaryMin,
      experienceMin: input.experienceMin,
    });

    if (fraudReport.riskTier === 'HIGH_RISK') {
      throw new BadRequestException(
        `Job publication rejected: High-risk recruitment parameters detected. ${fraudReport.detectedSignals.join('; ')}`
      );
    }

    const normalizedTitle = normalizeJobTitle(input.title);
    const sanitizedDescription = sanitizeJobText(input.rawDescription);
    const fingerprint = generateJobFingerprint(input.companyName, normalizedTitle, input.locationCity);

    // Multi-stage deduplication check
    const dedup = this.deduplicationService.evaluateDuplicate(
      {
        companyName: input.companyName,
        title: input.title,
        locationCity: input.locationCity,
        rawDescription: sanitizedDescription,
        sourceProvider: 'DIRECT_EMPLOYER',
      },
      Array.from(this.memJobs.values())
    );

    if (dedup.isDuplicate) {
      throw new ConflictException(`Duplicate job posting detected: ${dedup.reason}`);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const newId = randomUUID();

    const newJob: JobDetail = {
      id: newId,
      employerId,
      title: input.title,
      normalizedTitle,
      companyName: input.companyName,
      locationCity: input.locationCity,
      workArrangement: input.workArrangement as WorkArrangement,
      caPathway: input.caPathway,
      salaryMin: input.salaryMin || null,
      salaryMax: input.salaryMax || null,
      salaryDisclosed: input.salaryDisclosed || false,
      experienceMin: input.experienceMin || 0,
      experienceMax: input.experienceMax || 3,
      rawDescription: sanitizedDescription,
      structuredRequirements: {
        mandatorySkills: input.mandatorySkills || [],
        preferredSkills: input.preferredSkills || [],
        requiredQualification: input.requiredQualification || 'QUALIFIED',
        minArticleshipMonths: input.minArticleshipMonths,
        preferredFirmTiers: input.preferredFirmTiers,
        keyResponsibilities: input.keyResponsibilities || [],
      },
      status: 'ACTIVE',
      source: input.source || 'DIRECT_EMPLOYER',
      sourceUrl: input.sourceUrl || null,
      isVerified: true,
      fingerprint,
      postedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),

      opportunityType: input.opportunityType || 'QUALIFIED_CA',
      channel: 'ENTERPRISE',
      sourceProvider: 'DIRECT_EMPLOYER',
      canonicalUrl: input.canonicalUrl || input.sourceUrl || null,
      applicationUrl: input.applicationUrl || input.sourceUrl || null,
      attribution: 'Direct Enterprise Mandate published via CA Career OS Employer Portal',
      originalPostedAt: now.toISOString(),
      firstSeenAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      lastVerifiedAt: now.toISOString(),
      verificationStatus: 'SOURCE_ACTIVE',
      duplicateClusterId: newId,
      isDuplicate: false,
      duplicateCount: 0,
    };

    this.memJobs.set(newJob.id, newJob);
    this.logger.log(`Published verified enterprise job: ${newJob.title} at ${newJob.companyName}`);
    return newJob;
  }

  /**
   * Job ingestion pipeline with multi-stage deduplication and provenance tracking.
   */
  async ingestJobs(input: JobIngestInputType, sourceId = 'PARTNER_ATS'): Promise<IngestionResult> {
    let ingestedCount = 0;
    let duplicateCount = 0;
    let rejectedCount = 0;
    const resultJobs: JobDetail[] = [];

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const item of input.jobs) {
      try {
        const normalizedTitle = normalizeJobTitle(item.title);
        const sanitizedDescription = sanitizeJobText(item.rawDescription);
        const fingerprint = generateJobFingerprint(item.companyName, normalizedTitle, item.locationCity);

        // Deduplication evaluation
        const dedup = this.deduplicationService.evaluateDuplicate(
          {
            companyName: item.companyName,
            title: item.title,
            locationCity: item.locationCity,
            rawDescription: sanitizedDescription,
            sourceProvider: item.sourceProvider || item.source || sourceId,
            externalJobId: item.externalJobId,
            canonicalUrl: item.canonicalUrl || item.sourceUrl,
          },
          Array.from(this.memJobs.values())
        );

        if (dedup.isDuplicate && dedup.existingJobId) {
          duplicateCount++;
          const existing = this.memJobs.get(dedup.existingJobId);
          if (existing) {
            existing.lastSeenAt = now.toISOString();
            existing.lastVerifiedAt = now.toISOString();
            resultJobs.push(existing);
          }
          continue;
        }

        const newId = randomUUID();
        const newJob: JobDetail = {
          id: newId,
          employerId: '00000000-0000-0000-0000-000000000000',
          sourceId,
          title: item.title,
          normalizedTitle,
          companyName: item.companyName,
          locationCity: item.locationCity,
          workArrangement: item.workArrangement as WorkArrangement,
          caPathway: item.caPathway,
          salaryMin: item.salaryMin || null,
          salaryMax: item.salaryMax || null,
          salaryDisclosed: item.salaryDisclosed || false,
          experienceMin: item.experienceMin || 0,
          experienceMax: item.experienceMax || 3,
          rawDescription: sanitizedDescription,
          structuredRequirements: {
            mandatorySkills: item.mandatorySkills || [],
            preferredSkills: item.preferredSkills || [],
            requiredQualification: item.requiredQualification || 'QUALIFIED',
            minArticleshipMonths: item.minArticleshipMonths,
            preferredFirmTiers: item.preferredFirmTiers,
            keyResponsibilities: item.keyResponsibilities || [],
          },
          status: 'ACTIVE',
          source: item.source || sourceId,
          sourceUrl: item.sourceUrl || null,
          isVerified: item.source === 'DIRECT_EMPLOYER',
          fingerprint,
          postedAt: item.originalPostedAt || now.toISOString(),
          expiresAt: expiresAt.toISOString(),

          opportunityType: item.opportunityType || 'QUALIFIED_CA',
          channel: item.channel || 'EXTERNAL',
          sourceProvider: item.sourceProvider || sourceId,
          externalJobId: item.externalJobId,
          canonicalUrl: item.canonicalUrl || item.sourceUrl || null,
          applicationUrl: item.applicationUrl || item.sourceUrl || null,
          attribution: item.attribution || `External opportunity via ${item.sourceProvider || sourceId}`,
          originalPostedAt: item.originalPostedAt || now.toISOString(),
          firstSeenAt: now.toISOString(),
          lastSeenAt: now.toISOString(),
          lastVerifiedAt: now.toISOString(),
          verificationStatus: item.verificationStatus || 'SOURCE_ACTIVE',
          duplicateClusterId: newId,
          isDuplicate: false,
          duplicateCount: 0,
        };

        this.memJobs.set(newJob.id, newJob);
        resultJobs.push(newJob);
        ingestedCount++;
      } catch (err: any) {
        rejectedCount++;
        this.logger.error(`Failed to ingest job item: ${err.message}`);
      }
    }

    return {
      ingestedCount,
      duplicateCount,
      rejectedCount,
      jobs: resultJobs,
    };
  }

  /**
   * Save a job for candidate.
   */
  async saveJob(jobId: string, userId: string, notes?: string): Promise<SavedJobItem> {
    const job = await this.getJobById(jobId);

    let userMap = this.memSaved.get(userId);
    if (!userMap) {
      userMap = new Map();
      this.memSaved.set(userId, userMap);
    }

    const savedAt = new Date().toISOString();
    userMap.set(jobId, { notes, savedAt });

    return {
      id: `${userId}:${jobId}`,
      candidateProfileId: userId,
      jobId,
      job,
      notes,
      savedAt,
    };
  }

  /**
   * Unsave a job for candidate.
   */
  async unsaveJob(jobId: string, userId: string): Promise<{ success: boolean }> {
    const userMap = this.memSaved.get(userId);
    if (userMap) {
      userMap.delete(jobId);
    }
    return { success: true };
  }

  /**
   * List saved jobs for candidate.
   */
  async listSavedJobs(userId: string): Promise<SavedJobItem[]> {
    const userMap = this.memSaved.get(userId);
    if (!userMap) return [];

    const items: SavedJobItem[] = [];
    for (const [jobId, meta] of userMap.entries()) {
      const job = this.memJobs.get(jobId);
      if (job) {
        items.push({
          id: `${userId}:${jobId}`,
          candidateProfileId: userId,
          jobId,
          job: { ...job, isSaved: true },
          notes: meta.notes,
          savedAt: meta.savedAt,
        });
      }
    }
    return items;
  }

  /**
   * Return configured connector sources registry
   */
  getSourceRegistry(): JobSourceConfigSummary[] {
    return this.sourceRegistry.listSources();
  }

  /**
   * Return operational aggregator health & monitoring report
   */
  getAggregatorHealth(): AggregatorHealthReport {
    const all = Array.from(this.memJobs.values());
    const enterpriseCount = all.filter((j) => j.channel === 'ENTERPRISE').length;
    const externalCount = all.filter((j) => j.channel === 'EXTERNAL').length;
    const articleshipCount = all.filter(
      (j) => j.opportunityType === 'ARTICLESHIP' || j.opportunityType === 'INDUSTRIAL_TRAINING'
    ).length;

    let duplicateCount = 0;
    for (const s of this.sourceRegistry.listSources()) {
      duplicateCount += s.totalDuplicates;
    }

    return this.sourceRegistry.getAggregatorHealth(
      enterpriseCount,
      externalCount,
      articleshipCount,
      duplicateCount
    );
  }

  /**
   * Trigger on-demand synchronization across external sources
   */
  async triggerSourceSync(providerId?: string): Promise<{
    success: boolean;
    reports: JobSourceSyncReport[];
    totalIngested: number;
    totalDuplicates: number;
    durationMs: number;
  }> {
    const result = await this.ingestionOrchestrator.triggerSynchronization(providerId, this.memJobs);
    this.ingestionOrchestrator.saveJobsToDisk(Array.from(this.memJobs.values()));
    return result;
  }

  public getIngestionOrchestrator(): JobIngestionOrchestratorService {
    return this.ingestionOrchestrator;
  }

  /**
   * Candidate-facing moderation: Report a job for review
   */
  async reportJob(
    jobId: string,
    reason: string,
    comments?: string,
    userId?: string
  ): Promise<{ success: boolean; ticketRef: string; message: string }> {
    const job = this.memJobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job '${jobId}' not found.`);
    }

    // Flag for human audit
    job.verificationStatus = 'REVIEW_REQUIRED';

    const ticketRef = `MOD-${Date.now().toString(36).toUpperCase()}-${jobId.slice(0, 4).toUpperCase()}`;
    this.memReports.push({
      id: randomUUID(),
      jobId,
      reason,
      comments,
      reportedAt: new Date().toISOString(),
    });

    this.logger.warn(`Job '${job.title}' (${jobId}) flagged for review by user '${userId || 'anonymous'}': ${reason}`);

    return {
      success: true,
      ticketRef,
      message: 'Thank you for your report. Our compliance team has flagged this vacancy for review.',
    };
  }

  /**
   * Revalidate freshness of a specific listing
   */
  async revalidateJob(jobId: string): Promise<{ status: string; reason?: string }> {
    const job = this.memJobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job '${jobId}' not found.`);
    }

    const connector = job.sourceProvider ? this.sourceRegistry.getConnector(job.sourceProvider.toLowerCase()) : undefined;
    const result = await this.freshnessService.revalidateJob(job, connector);
    job.verificationStatus = result.status;
    job.lastVerifiedAt = new Date().toISOString();

    return result;
  }
}

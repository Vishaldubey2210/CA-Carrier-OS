import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
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
  SavedJobItem,
  WorkArrangement,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  calculateJobMatch,
  generateJobFingerprint,
  normalizeJobTitle,
  sanitizeJobText,
} from './job-matching.engine.js';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  // In-memory fallback stores
  private readonly memJobs = new Map<string, JobDetail>(); // jobId -> JobDetail
  private readonly memSaved = new Map<string, Map<string, { notes?: string; savedAt: string }>>(); // userId -> (jobId -> metadata)

  constructor(private readonly prisma: PrismaService) {
    this.seedInitialCuratedJobs();
  }

  /**
   * Seed curated initial jobs for development, test, and immediate discovery.
   */
  private seedInitialCuratedJobs() {
    const defaultJobs: Array<Omit<JobDetail, 'id' | 'postedAt' | 'expiresAt' | 'fingerprint'>> = [
      {
        employerId: '00000000-0000-0000-0000-000000000001',
        title: 'Senior Associate — Statutory Audit & Assurance',
        normalizedTitle: 'Statutory Audit Senior / Manager',
        companyName: 'Grant Thornton Bharat LLP',
        locationCity: 'Mumbai',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.AUDIT,
        salaryMin: 1400000,
        salaryMax: 1800000,
        salaryDisclosed: true,
        experienceMin: 0,
        experienceMax: 2,
        rawDescription: 'Lead statutory audit engagements for listed and private corporate entities in accordance with Standards on Auditing (SAs) and Ind AS. Evaluate Internal Financial Controls over Financial Reporting (IFCoFR) and CARO 2020.',
        structuredRequirements: {
          mandatorySkills: ['Statutory Audit', 'Ind AS', 'IFCoFR', 'CARO 2020'],
          preferredSkills: ['Advanced Excel', 'SAP ERP', 'IFRS'],
          requiredQualification: 'QUALIFIED',
          minArticleshipMonths: 24,
          preferredFirmTiers: ['BIG4', 'TOP10', 'MID_SIZE'],
          keyResponsibilities: [
            'Plan and execute statutory audit engagements.',
            'Review financial statements prepared under Ind AS.',
            'Lead junior articleship trainees and client query resolution.',
          ],
        },
        status: 'ACTIVE',
        source: 'DIRECT_EMPLOYER',
        sourceUrl: 'https://gtbharat.com/careers',
        isVerified: true,
      },
      {
        employerId: '00000000-0000-0000-0000-000000000002',
        title: 'Manager — Financial Due Diligence & M&A',
        normalizedTitle: 'M&A Due Diligence & Valuation Associate',
        companyName: 'BDO India LLP',
        locationCity: 'Bengaluru',
        workArrangement: 'ONSITE',
        caPathway: CAPathway.IB,
        salaryMin: 2200000,
        salaryMax: 2800000,
        salaryDisclosed: true,
        experienceMin: 1,
        experienceMax: 4,
        rawDescription: 'Conduct buy-side and sell-side financial due diligence (FDD) for private equity, venture capital, and strategic buyers. Analyze Quality of Earnings (QoE), normalized working capital, and net debt items.',
        structuredRequirements: {
          mandatorySkills: ['Financial Due Diligence', 'Quality of Earnings', 'Valuation', 'Financial Modeling'],
          preferredSkills: ['DCF', 'M&A', 'PowerBI'],
          requiredQualification: 'QUALIFIED',
          minArticleshipMonths: 36,
          preferredFirmTiers: ['BIG4', 'TOP10'],
          keyResponsibilities: [
            'Perform deep-dive analysis on client earnings quality and EBITDA adjustments.',
            'Evaluate working capital peg and debt-like items.',
            'Draft comprehensive diligence reports for private equity investment committees.',
          ],
        },
        status: 'ACTIVE',
        source: 'DIRECT_EMPLOYER',
        sourceUrl: 'https://bdo.in/careers',
        isVerified: true,
      },
      {
        employerId: '00000000-0000-0000-0000-000000000003',
        title: 'AVP — Corporate Financial Planning & Analysis',
        normalizedTitle: 'FP&A & Corporate Finance Manager',
        companyName: 'Razorpay Software',
        locationCity: 'Bengaluru',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.FPA,
        salaryMin: 2600000,
        salaryMax: 3400000,
        salaryDisclosed: true,
        experienceMin: 2,
        experienceMax: 5,
        rawDescription: 'Drive annual budgeting, quarterly rolling forecasts, and SaaS metrics analysis. Partner with business unit leads to model unit economics, gross margins, and burn rates.',
        structuredRequirements: {
          mandatorySkills: ['FP&A', 'Financial Modeling', 'Variance Analysis', 'Budgeting'],
          preferredSkills: ['SQL', 'PowerBI', 'Fintech Metrics', 'Advanced Excel'],
          requiredQualification: 'QUALIFIED',
          minArticleshipMonths: 36,
          preferredFirmTiers: ['BIG4', 'TOP10', 'MID_SIZE'],
          keyResponsibilities: [
            'Own company-wide 3-statement financial models and forecasting cycles.',
            'Deliver variance explanations to executive leadership and board members.',
            'Build automated reporting dashboards for revenue pacing.',
          ],
        },
        status: 'ACTIVE',
        source: 'DIRECT_EMPLOYER',
        sourceUrl: 'https://razorpay.com/jobs',
        isVerified: true,
      },
      {
        employerId: '00000000-0000-0000-0000-000000000004',
        title: 'Senior Associate — Corporate Tax & Transfer Pricing',
        normalizedTitle: 'Direct Tax & Litigation Specialist',
        companyName: 'EY India (Ernst & Young)',
        locationCity: 'Delhi NCR',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.TAX,
        salaryMin: 1500000,
        salaryMax: 1900000,
        salaryDisclosed: true,
        experienceMin: 0,
        experienceMax: 3,
        rawDescription: 'Advise multinational clients on corporate direct tax, transfer pricing documentation, benchmarking studies, and tax assessment litigation before appellate authorities.',
        structuredRequirements: {
          mandatorySkills: ['Direct Tax', 'Transfer Pricing', 'Corporate Tax', 'Tax Audit'],
          preferredSkills: ['Litigation Drafting', 'Benchmarking Studies', 'TDS'],
          requiredQualification: 'QUALIFIED',
          minArticleshipMonths: 24,
          preferredFirmTiers: ['BIG4', 'TOP10'],
          keyResponsibilities: [
            'Prepare transfer pricing local files and 3CEB accountant reports.',
            'Handle corporate tax returns and tax provisioning.',
            'Draft submissions for CIT(A) and ITAT appeals.',
          ],
        },
        status: 'ACTIVE',
        source: 'DIRECT_EMPLOYER',
        sourceUrl: 'https://ey.com/en_in/careers',
        isVerified: true,
      },
      {
        employerId: '00000000-0000-0000-0000-000000000005',
        title: 'Lead Associate — Independent Practice Advisory',
        normalizedTitle: 'Independent Practice Lead',
        companyName: 'Corporate Advisory & Partners',
        locationCity: 'Mumbai',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.PRACTICE,
        salaryMin: 1200000,
        salaryMax: 1600000,
        salaryDisclosed: true,
        experienceMin: 0,
        experienceMax: 3,
        rawDescription: 'Manage client accounts across SME compliance, ROC filings, GST advisory, and virtual CFO services for emerging startups and mid-market enterprises.',
        structuredRequirements: {
          mandatorySkills: ['GST', 'ROC Compliance', 'TDS', 'Client Advisory'],
          preferredSkills: ['Virtual CFO', 'Startup Compliance', 'Tally Prime'],
          requiredQualification: 'QUALIFIED',
          minArticleshipMonths: 24,
          preferredFirmTiers: ['MID_SIZE', 'BOUTIQUE', 'TOP10'],
          keyResponsibilities: [
            'Oversee monthly GST, TDS, and advance tax compliance calendar.',
            'Prepare MIS packs and board presentations for startup founders.',
            'Direct articleship trainees in client field engagements.',
          ],
        },
        status: 'ACTIVE',
        source: 'DIRECT_EMPLOYER',
        sourceUrl: 'https://corporateadvisory.in',
        isVerified: true,
      },
    ];

    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day freshness

    for (const j of defaultJobs) {
      const id = randomUUID();
      const fingerprint = generateJobFingerprint(j.companyName, j.normalizedTitle, j.locationCity);
      const jobDetail: JobDetail = {
        ...j,
        id,
        postedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        fingerprint,
      };
      this.memJobs.set(id, jobDetail);
    }
    this.logger.log(`Initialized ${this.memJobs.size} curated CA jobs in memory repository.`);
  }

  /**
   * Search and filter jobs with pagination and optional match scoring.
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

    let allJobs = Array.from(this.memJobs.values()).filter(j => j.status === 'ACTIVE');

    // 1. Keyword search (title, company, description, skills)
    if (filter.query) {
      const q = filter.query.toLowerCase().trim();
      allJobs = allJobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.locationCity.toLowerCase().includes(q) ||
        j.rawDescription.toLowerCase().includes(q) ||
        j.structuredRequirements.mandatorySkills.some(s => s.toLowerCase().includes(q))
      );
    }

    // 2. Filter by CA Pathway
    if (filter.caPathway) {
      allJobs = allJobs.filter(j => j.caPathway === filter.caPathway);
    }

    // 3. Filter by City
    if (filter.city) {
      const city = filter.city.toLowerCase().trim();
      allJobs = allJobs.filter(j => j.locationCity.toLowerCase().includes(city));
    }

    // 4. Filter by Work Arrangement
    if (filter.workArrangement) {
      allJobs = allJobs.filter(j => j.workArrangement === filter.workArrangement);
    }

    // 5. Filter by Min Salary
    if (filter.minSalary !== undefined) {
      allJobs = allJobs.filter(j => (j.salaryMax || 0) >= filter.minSalary!);
    }

    // 6. Filter by Min Experience
    if (filter.minExperience !== undefined) {
      allJobs = allJobs.filter(j => j.experienceMin <= filter.minExperience!);
    }

    // 7. Filter by Saved Only
    if (filter.savedOnly && userId) {
      allJobs = allJobs.filter(j => userSavedSet.has(j.id));
    }

    // 8. Compute match scores if candidate profile is supplied
    const jobsWithScores = allJobs.map(job => {
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

    // 9. Sort
    if (filter.sortBy === 'matchScore') {
      jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (filter.sortBy === 'salary') {
      jobsWithScores.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    } else {
      jobsWithScores.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    // 10. Paginate
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
   * Get single job by ID.
   */
  async getJobById(jobId: string, profile?: CandidateProfileData, userId?: string): Promise<JobDetail> {
    if (this.prisma.isDatabaseConnected()) {
      const dbJob = await this.prisma.job.findUnique({ where: { id: jobId } });
      if (dbJob) {
        const jobDetail: JobDetail = {
          id: dbJob.id,
          employerId: dbJob.employerId,
          title: dbJob.title,
          normalizedTitle: dbJob.normalizedTitle,
          companyName: dbJob.companyName,
          locationCity: dbJob.locationCity,
          workArrangement: dbJob.workArrangement as WorkArrangement,
          caPathway: dbJob.caPathway as unknown as CAPathway,
          salaryMin: dbJob.salaryMin,
          salaryMax: dbJob.salaryMax,
          salaryDisclosed: dbJob.salaryDisclosed,
          experienceMin: dbJob.experienceMin,
          experienceMax: dbJob.experienceMax,
          rawDescription: dbJob.rawDescription,
          structuredRequirements: dbJob.structuredRequirements as any,
          status: dbJob.status as any,
          source: dbJob.source as any,
          sourceUrl: dbJob.sourceUrl,
          isVerified: dbJob.isVerified,
          fingerprint: dbJob.fingerprint,
          postedAt: dbJob.postedAt.toISOString(),
          expiresAt: dbJob.expiresAt.toISOString(),
        };

        let matchScore: number | undefined;
        if (profile) {
          const matchReport = calculateJobMatch(profile, jobDetail);
          matchScore = matchReport.matchScore;
        }

        const isSaved = userId ? this.memSaved.get(userId)?.has(jobId) || false : false;

        return {
          ...jobDetail,
          matchScore,
          isSaved,
        };
      }
    }

    const job = this.memJobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    let matchScore: number | undefined;
    if (profile) {
      const matchReport = calculateJobMatch(profile, job);
      matchScore = matchReport.matchScore;
    }

    const isSaved = userId ? this.memSaved.get(userId)?.has(jobId) || false : false;

    return {
      ...job,
      matchScore,
      isSaved,
    };
  }

  /**
   * Get explainable job match against profile.
   */
  async getJobMatch(jobId: string, profile: CandidateProfileData): Promise<JobMatchReport> {
    const job = await this.getJobById(jobId);
    return calculateJobMatch(profile, job);
  }

  /**
   * Recruiter / Employer publishes a direct verified job.
   */
  async publishJob(input: CreateJobInput, employerId: string): Promise<JobDetail> {
    const normalizedTitle = normalizeJobTitle(input.title);
    const sanitizedDescription = sanitizeJobText(input.rawDescription);
    const fingerprint = generateJobFingerprint(input.companyName, normalizedTitle, input.locationCity);

    if (this.prisma.isDatabaseConnected()) {
      const existing = await this.prisma.job.findFirst({ where: { fingerprint } });
      if (existing) {
        throw new ConflictException(`A similar job posting for '${input.companyName}' in '${input.locationCity}' already exists.`);
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const dbJob = await this.prisma.job.create({
        data: {
          id: randomUUID(),
          employerId,
          title: input.title,
          normalizedTitle,
          companyName: input.companyName,
          locationCity: input.locationCity,
          workArrangement: (input.workArrangement as string) || 'HYBRID',
          caPathway: input.caPathway as any,
          salaryMin: input.salaryMin || null,
          salaryMax: input.salaryMax || null,
          salaryDisclosed: input.salaryDisclosed || false,
          experienceMin: input.experienceMin || 0,
          experienceMax: input.experienceMax || 3,
          rawDescription: sanitizedDescription,
          structuredRequirements: {
            mandatorySkills: input.mandatorySkills || [],
            preferredSkills: input.preferredSkills || [],
            requiredQualification: input.requiredQualification,
            minArticleshipMonths: input.minArticleshipMonths,
            preferredFirmTiers: input.preferredFirmTiers,
            keyResponsibilities: input.keyResponsibilities || [],
          },
          status: 'ACTIVE',
          source: input.source || 'DIRECT_EMPLOYER',
          sourceUrl: input.sourceUrl || null,
          isVerified: true,
          fingerprint,
          expiresAt,
        },
      });

      this.logger.log(`Published new verified job posting to DB: ${dbJob.title} at ${dbJob.companyName}`);
      return {
        id: dbJob.id,
        employerId: dbJob.employerId,
        title: dbJob.title,
        normalizedTitle: dbJob.normalizedTitle,
        companyName: dbJob.companyName,
        locationCity: dbJob.locationCity,
        workArrangement: dbJob.workArrangement as WorkArrangement,
        caPathway: dbJob.caPathway as unknown as CAPathway,
        salaryMin: dbJob.salaryMin,
        salaryMax: dbJob.salaryMax,
        salaryDisclosed: dbJob.salaryDisclosed,
        experienceMin: dbJob.experienceMin,
        experienceMax: dbJob.experienceMax,
        rawDescription: dbJob.rawDescription,
        structuredRequirements: dbJob.structuredRequirements as any,
        status: dbJob.status as any,
        source: dbJob.source as any,
        sourceUrl: dbJob.sourceUrl,
        isVerified: dbJob.isVerified,
        fingerprint: dbJob.fingerprint,
        postedAt: dbJob.postedAt.toISOString(),
        expiresAt: dbJob.expiresAt.toISOString(),
      };
    }

    // Duplicate detection check
    const existing = Array.from(this.memJobs.values()).find(j => j.fingerprint === fingerprint);
    if (existing) {
      throw new ConflictException(`A similar job posting for '${input.companyName}' in '${input.locationCity}' already exists.`);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day auto-expiry

    const newJob: JobDetail = {
      id: randomUUID(),
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
        requiredQualification: input.requiredQualification,
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
    };

    this.memJobs.set(newJob.id, newJob);
    this.logger.log(`Published new verified job posting: ${newJob.title} at ${newJob.companyName}`);
    return newJob;
  }

  /**
   * Job ingestion pipeline with normalization, duplicate detection, and sanitization.
   */
  async ingestJobs(input: JobIngestInputType, sourceId: string = 'PARTNER_ATS'): Promise<IngestionResult> {
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

        // Deduplication check
        const existing = Array.from(this.memJobs.values()).find(j => j.fingerprint === fingerprint);
        if (existing) {
          duplicateCount++;
          // Freshness policy: update existing expiration timestamp rather than duplicating
          existing.expiresAt = expiresAt.toISOString();
          resultJobs.push(existing);
          continue;
        }

        const newJob: JobDetail = {
          id: randomUUID(),
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
            requiredQualification: item.requiredQualification,
            minArticleshipMonths: item.minArticleshipMonths,
            preferredFirmTiers: item.preferredFirmTiers,
            keyResponsibilities: item.keyResponsibilities || [],
          },
          status: 'ACTIVE',
          source: item.source || 'PARTNER_ATS',
          sourceUrl: item.sourceUrl || null,
          isVerified: item.source === 'DIRECT_EMPLOYER',
          fingerprint,
          postedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        };

        this.memJobs.set(newJob.id, newJob);
        resultJobs.push(newJob);
        ingestedCount++;
      } catch (err) {
        rejectedCount++;
        this.logger.error(`Failed to ingest job item: ${(err as Error).message}`);
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
}

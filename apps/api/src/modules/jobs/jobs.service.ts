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
   * Seed curated initial jobs spanning both Native Enterprise and External Opportunities,
   * covering Articleship, Industrial Training, Audit, Tax, FP&A, and Freshers.
   */
  private seedInitialCuratedJobs() {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const defaultJobs: Array<Omit<JobDetail, 'id' | 'postedAt' | 'expiresAt' | 'fingerprint'>> = [
      // 1. Native Enterprise: Qualified CA - Statutory Audit
      {
        employerId: '00000000-0000-0000-0000-000000000001',
        title: 'Senior Associate — Statutory Audit & Assurance',
        normalizedTitle: 'Statutory Audit Senior / Manager',
        companyName: 'Grant Thornton Bharat LLP',
        locationCity: 'Mumbai',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.AUDIT,
        opportunityType: 'QUALIFIED_CA',
        channel: 'ENTERPRISE',
        sourceProvider: 'DIRECT_EMPLOYER',
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
        canonicalUrl: 'https://gtbharat.com/careers/stat-audit-sr',
        applicationUrl: 'https://gtbharat.com/careers/stat-audit-sr/apply',
        attribution: 'Direct Enterprise Opening verified by Grant Thornton Bharat HR',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // Native Enterprise: BDO India M&A
      {
        employerId: '00000000-0000-0000-0000-000000000002',
        title: 'Manager — Financial Due Diligence & M&A',
        normalizedTitle: 'M&A Due Diligence & Valuation Associate',
        companyName: 'BDO India LLP',
        locationCity: 'Bengaluru',
        workArrangement: 'ONSITE',
        caPathway: CAPathway.IB,
        opportunityType: 'QUALIFIED_CA',
        channel: 'ENTERPRISE',
        sourceProvider: 'DIRECT_EMPLOYER',
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
        canonicalUrl: 'https://bdo.in/careers/mna-fdd-mgr',
        applicationUrl: 'https://bdo.in/careers/mna-fdd-mgr/apply',
        attribution: 'Direct Enterprise Mandate verified by BDO India Advisory',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // 2. Native Enterprise: Articleship Scheme for CA Students
      {
        employerId: '00000000-0000-0000-0000-000000000006',
        title: 'CA Article Assistant — 3-Year Articleship Scheme (Form 108)',
        normalizedTitle: 'CA Article Trainee — Statutory & Tax Audit',
        companyName: 'Singhi & Co Chartered Accountants',
        locationCity: 'Delhi NCR',
        workArrangement: 'ONSITE',
        caPathway: CAPathway.AUDIT,
        opportunityType: 'ARTICLESHIP',
        channel: 'ENTERPRISE',
        sourceProvider: 'DIRECT_EMPLOYER',
        salaryMin: 216000,
        salaryMax: 300000,
        salaryDisclosed: true,
        experienceMin: 0,
        experienceMax: 0,
        rawDescription: 'ICAI-registered 3-year articleship position under leading Top 10 Indian CA partnership firm. Trainees receive extensive rotational experience across Section 44AB Tax Audits, Listed Company Statutory Audits, Transfer Pricing Form 3CEB, and GST compliance.',
        structuredRequirements: {
          mandatorySkills: ['CA Intermediate (Both Groups / Single Group)', 'ICITSS ITT & Orientation'],
          preferredSkills: ['Tally Prime', 'MS Excel', 'Basic CARO 2020'],
          requiredQualification: 'SEMI_QUALIFIED',
          minArticleshipMonths: 0,
          preferredFirmTiers: ['TOP10', 'MID_SIZE'],
          keyResponsibilities: [
            'Vouching and verification of books of accounts for manufacturing and service clients.',
            'Preparation of 3CD annexures and depreciation schedules under Income Tax Act.',
            'Drafting audit queries under guidance of Audit Partner.',
          ],
        },
        status: 'ACTIVE',
        source: 'DIRECT_EMPLOYER',
        sourceUrl: 'https://singhico.com/careers',
        canonicalUrl: 'https://singhico.com/careers/articleship-2026',
        applicationUrl: 'https://singhico.com/careers/articleship-2026/apply',
        attribution: 'Direct Enterprise Articleship Vacancy verified under ICAI Bye-Laws',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // 3. Native Enterprise: CA Industrial Training
      {
        employerId: '00000000-0000-0000-0000-000000000007',
        title: 'CA Industrial Trainee — Statutory Reporting & Ind AS 115',
        normalizedTitle: 'CA Industrial Trainee — Financial Reporting',
        companyName: 'Deloitte India Advisory',
        locationCity: 'Bengaluru',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.AUDIT,
        opportunityType: 'INDUSTRIAL_TRAINING',
        channel: 'ENTERPRISE',
        sourceProvider: 'DIRECT_EMPLOYER',
        salaryMin: 480000,
        salaryMax: 600000,
        salaryDisclosed: true,
        experienceMin: 0,
        experienceMax: 1,
        rawDescription: '12-to-18 month CA Industrial Training placement under Regulation 51 of Chartered Accountants Regulations. Assist engagement teams on complex Ind AS 115 revenue accounting, CARO 2020 inventory valuation, and technical accounting memos. Monthly stipend: Rs. 40,000 to Rs. 50,000.',
        structuredRequirements: {
          mandatorySkills: ['Completed minimum 18 months articleship', 'Principal NOC', 'Ind AS basics'],
          preferredSkills: ['Advanced Excel', 'Financial Modeling', 'Audit Documentation'],
          requiredQualification: 'SEMI_QUALIFIED',
          minArticleshipMonths: 18,
          preferredFirmTiers: ['BIG4', 'TOP10'],
          keyResponsibilities: [
            'Analyze complex contractual terms for revenue recognition under Ind AS 115.',
            'Prepare audit workpapers documenting testing of internal controls.',
            'Liaise with client accounting controllers on year-end financial closing schedules.',
          ],
        },
        status: 'ACTIVE',
        source: 'DIRECT_EMPLOYER',
        sourceUrl: 'https://deloitte.com/in/careers',
        canonicalUrl: 'https://deloitte.com/in/careers/industrial-trainee-2026',
        applicationUrl: 'https://deloitte.com/in/careers/industrial-trainee-2026/apply',
        attribution: 'Direct Enterprise Industrial Training Opening — Deloitte India Partner Desk',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // 4. Native Enterprise: CA Fresher - Corporate Tax
      {
        employerId: '00000000-0000-0000-0000-000000000004',
        title: 'Associate — Direct Tax & Transfer Pricing (CA Fresher Welcome)',
        normalizedTitle: 'Direct Tax & Litigation Specialist',
        companyName: 'EY India (Ernst & Young)',
        locationCity: 'Delhi NCR',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.TAX,
        opportunityType: 'CA_FRESHER',
        channel: 'ENTERPRISE',
        sourceProvider: 'DIRECT_EMPLOYER',
        salaryMin: 1400000,
        salaryMax: 1750000,
        salaryDisclosed: true,
        experienceMin: 0,
        experienceMax: 1,
        rawDescription: 'Advise multinational clients on corporate direct tax, transfer pricing documentation, benchmarking studies, and tax assessment litigation before appellate authorities. Welcoming newly qualified Chartered Accountants from Nov 2025 / May 2025 cycles.',
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
        canonicalUrl: 'https://ey.com/en_in/careers/tax-assoc-fresher',
        applicationUrl: 'https://ey.com/en_in/careers/tax-assoc-fresher/apply',
        attribution: 'Direct Enterprise Mandate verified by EY India Campus Recruiting',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // 5. External Opportunity: Greenhouse Job Board (Razorpay)
      {
        employerId: '00000000-0000-0000-0000-0000000000e1',
        title: 'AVP — Corporate Financial Planning & Analysis (FP&A Lead)',
        normalizedTitle: 'FP&A & Corporate Finance Manager',
        companyName: 'Razorpay Software',
        locationCity: 'Bengaluru',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.FPA,
        opportunityType: 'QUALIFIED_CA',
        channel: 'EXTERNAL',
        sourceProvider: 'GREENHOUSE',
        externalJobId: 'gh-razorpay-fpa-401',
        salaryMin: 2600000,
        salaryMax: 3400000,
        salaryDisclosed: true,
        experienceMin: 3,
        experienceMax: 6,
        rawDescription: 'Drive annual budgeting, quarterly rolling forecasts, and SaaS metrics analysis. Partner with business unit leads to model unit economics, gross margins, and burn rates for India’s premier fintech gateway.',
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
        source: 'GREENHOUSE',
        sourceUrl: 'https://boards.greenhouse.io/razorpay/jobs/gh-razorpay-fpa-401',
        canonicalUrl: 'https://boards.greenhouse.io/razorpay/jobs/gh-razorpay-fpa-401',
        applicationUrl: 'https://boards.greenhouse.io/razorpay/jobs/gh-razorpay-fpa-401#app',
        attribution: 'Official external listing published via Razorpay Software Greenhouse ATS Board',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // 6. External Opportunity: Lever Postings API (Groww)
      {
        employerId: '00000000-0000-0000-0000-0000000000e2',
        title: 'Manager — Regulatory Capital & Financial Reporting (CA)',
        normalizedTitle: 'Financial Reporting & Regulatory Manager',
        companyName: 'Groww India (Nextbillion Technology)',
        locationCity: 'Bengaluru',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.AUDIT,
        opportunityType: 'QUALIFIED_CA',
        channel: 'EXTERNAL',
        sourceProvider: 'LEVER',
        externalJobId: 'lev-groww-reg-501',
        salaryMin: 2200000,
        salaryMax: 2900000,
        salaryDisclosed: true,
        experienceMin: 2,
        experienceMax: 5,
        rawDescription: 'Supervise SEBI / RBI regulatory reporting, capital adequacy calculations, quarterly financial statements closure under Ind AS, and coordinate with statutory auditors for fast-growing investment platform.',
        structuredRequirements: {
          mandatorySkills: ['Ind AS', 'SEBI Compliance', 'Financial Controls', 'Capital Adequacy'],
          preferredSkills: ['Fintech Operations', 'SAP', 'TDS'],
          requiredQualification: 'QUALIFIED',
          minArticleshipMonths: 36,
          preferredFirmTiers: ['BIG4', 'TOP10'],
          keyResponsibilities: [
            'Prepare and file periodic financial reports with SEBI and stock exchanges.',
            'Lead month-end Ind AS balance sheet reconciliations.',
            'Maintain audit trails for compliance inspections.',
          ],
        },
        status: 'ACTIVE',
        source: 'LEVER',
        sourceUrl: 'https://jobs.lever.co/groww/lev-groww-reg-501',
        canonicalUrl: 'https://jobs.lever.co/groww/lev-groww-reg-501',
        applicationUrl: 'https://jobs.lever.co/groww/lev-groww-reg-501/apply',
        attribution: 'Official external listing published via Groww India Lever ATS',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // 7. External Opportunity: Ashby Job Board (Postman)
      {
        employerId: '00000000-0000-0000-0000-0000000000e3',
        title: 'Senior Manager — Global Accounting & Tax (Qualified CA)',
        normalizedTitle: 'Global Accounting & Tax Lead',
        companyName: 'Postman India',
        locationCity: 'Bengaluru',
        workArrangement: 'REMOTE',
        caPathway: CAPathway.TAX,
        opportunityType: 'QUALIFIED_CA',
        channel: 'EXTERNAL',
        sourceProvider: 'ASHBY',
        externalJobId: 'ash-postman-tax-601',
        salaryMin: 3000000,
        salaryMax: 3800000,
        salaryDisclosed: true,
        experienceMin: 4,
        experienceMax: 8,
        rawDescription: 'Lead the India financial reporting entity, oversee monthly closes, statutory audits under Companies Act 2013, transfer pricing cross-border compliance, and US GAAP to Ind AS reconciliations.',
        structuredRequirements: {
          mandatorySkills: ['US GAAP', 'Ind AS', 'Transfer Pricing', 'SaaS Accounting'],
          preferredSkills: ['Netsuite', 'Global Tax', 'Excel'],
          requiredQualification: 'QUALIFIED',
          minArticleshipMonths: 36,
          preferredFirmTiers: ['BIG4'],
          keyResponsibilities: [
            'Manage statutory financial audit cycles across India and global subsidiaries.',
            'Ensure full transfer pricing compliance for cross-border software R&D transactions.',
            'Architect scalable financial processes on NetSuite ERP.',
          ],
        },
        status: 'ACTIVE',
        source: 'ASHBY',
        sourceUrl: 'https://jobs.ashbyhq.com/postman/ash-postman-tax-601',
        canonicalUrl: 'https://jobs.ashbyhq.com/postman/ash-postman-tax-601',
        applicationUrl: 'https://jobs.ashbyhq.com/postman/ash-postman-tax-601/application',
        attribution: 'Official external listing published via Postman Ashby ATS',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // 8. External Opportunity: ICAI Official Campus Portal (LINK_ONLY)
      {
        employerId: '00000000-0000-0000-0000-0000000000e4',
        title: 'ICAI CMI&B 61st Campus Placement Programme (Newly Qualified CAs)',
        normalizedTitle: 'ICAI Campus Placement — Fresh Qualified CAs',
        companyName: 'ICAI Committee for Members in Industry & Business (CMI&B)',
        locationCity: 'All India (Mumbai, Delhi, Bengaluru, Chennai, Kolkata)',
        workArrangement: 'ONSITE',
        caPathway: CAPathway.AUDIT,
        opportunityType: 'CA_FRESHER',
        channel: 'EXTERNAL',
        sourceProvider: 'ICAI_PORTAL',
        externalJobId: 'icai-cmib-campus-2026',
        salaryMin: 900000,
        salaryMax: 2800000,
        salaryDisclosed: true,
        experienceMin: 0,
        experienceMax: 1,
        rawDescription: 'Official campus recruitment drive conducted by ICAI CMI&B connecting fresh Chartered Accountants with Top 20 CA firms, Big 4, Public Sector Undertakings (PSUs), and multinational corporations. Candidates must register with valid ICAI Roll Number.',
        structuredRequirements: {
          mandatorySkills: ['ICAI CA Final Pass Certificate', 'Form 108 Articleship Completion'],
          preferredSkills: ['GMCS / MCS Completion', 'Advanced IT Training'],
          requiredQualification: 'QUALIFIED',
          minArticleshipMonths: 36,
          preferredFirmTiers: ['BIG4', 'TOP10', 'MID_SIZE'],
          keyResponsibilities: [
            'Participate in national ICAI campus interview cycles.',
            'Interview with premier corporate recruiters and audit firms.',
          ],
        },
        status: 'ACTIVE',
        source: 'ICAI_PORTAL',
        sourceUrl: 'https://cajobs.icai.org/',
        canonicalUrl: 'https://cajobs.icai.org/',
        applicationUrl: 'https://cajobs.icai.org/candidate_login.php',
        attribution: 'Official statutory link to ICAI CMI&B National Campus Recruitment Portal',
        isVerified: true,
        verificationStatus: 'SOURCE_ACTIVE',
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        originalPostedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const j of defaultJobs) {
      const id = randomUUID();
      const fingerprint = generateJobFingerprint(j.companyName, j.normalizedTitle, j.locationCity);
      const jobDetail: JobDetail = {
        ...j,
        id,
        postedAt: j.originalPostedAt || now.toISOString(),
        expiresAt: expires.toISOString(),
        fingerprint,
        duplicateClusterId: id,
        isDuplicate: false,
        duplicateCount: 0,
      };
      this.memJobs.set(id, jobDetail);
    }

    this.ingestionOrchestrator.saveJobsToDisk(Array.from(this.memJobs.values()));
    for (const job of this.memJobs.values()) {
      this.ingestionOrchestrator.persistJobToDatabase(job).catch(() => {});
    }

    this.logger.log(`Initialized ${this.memJobs.size} curated multi-source CA opportunities (Enterprise + External ATS feeds).`);
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

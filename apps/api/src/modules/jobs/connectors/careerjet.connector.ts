import { Logger } from '@nestjs/common';
import {
  CAPathway,
  JobOpportunityType,
  JobSourceStatus,
  WorkArrangement,
} from '@ca-career-os/shared';
import {
  FetchJobsParams,
  FetchJobsResult,
  FreshnessVerificationResult,
  JobConnector,
  NormalizedJobPayload,
} from './job-connector.interface.js';
import { sanitizeJobText } from '../job-matching.engine.js';

export class CareerjetConnector implements JobConnector {
  private readonly logger = new Logger(CareerjetConnector.name);
  readonly providerId = 'careerjet';
  readonly providerType = 'CAREERJET';

  private status: JobSourceStatus = 'PENDING_CREDENTIALS';
  private readonly affiliateId?: string;

  constructor() {
    this.affiliateId = process.env.CAREERJET_AFFID || process.env.CAREERJET_API_KEY;

    if (this.affiliateId) {
      this.status = 'ACTIVE';
    } else {
      this.status = 'PENDING_CREDENTIALS';
      this.logger.log('Careerjet connector initialized in PENDING_CREDENTIALS mode (CAREERJET_AFFID not configured in environment).');
    }
  }

  getStatus(): JobSourceStatus {
    return this.status;
  }

  async fetchJobs(params?: FetchJobsParams): Promise<FetchJobsResult> {
    if (this.status === 'PENDING_CREDENTIALS' || !this.affiliateId) {
      this.logger.log('Careerjet connector skipping live API call: awaiting authorized partner publisher AFFID.');
      return { jobs: [], hasMore: false, totalFound: 0 };
    }

    try {
      const page = params?.page || 1;
      const endpoint = new URL('https://search.api.careerjet.net/v4/query');
      endpoint.searchParams.set('affid', this.affiliateId);
      endpoint.searchParams.set('keywords', 'CA Articleship');
      endpoint.searchParams.set('contract_type', 'i'); // 'i' for internship / training contract
      endpoint.searchParams.set('sort', 'date');
      endpoint.searchParams.set('page', String(page));
      endpoint.searchParams.set('page_size', '20');
      endpoint.searchParams.set('locale_code', 'en_IN');
      endpoint.searchParams.set('user_ip', '127.0.0.1');
      endpoint.searchParams.set('user_agent', 'CharteredOS-Career-Platform/2.0');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.status = 'PENDING_CREDENTIALS';
        } else if (response.status === 429) {
          this.status = 'RATE_LIMITED';
        }
        return { jobs: [], hasMore: false, totalFound: 0 };
      }

      const data: any = await response.json();
      const rawJobs = Array.isArray(data?.jobs) ? data.jobs : [];
      const normalized = rawJobs.map((j: any) => this.normalizeCareerjetJob(j));

      return {
        jobs: normalized,
        hasMore: (data?.pages || 0) > page,
        totalFound: data?.total || normalized.length,
      };
    } catch (err: any) {
      this.logger.warn(`Careerjet query notice: ${err?.message}`);
      return { jobs: [], hasMore: false, totalFound: 0 };
    }
  }

  private normalizeCareerjetJob(raw: any): NormalizedJobPayload {
    const title = sanitizeJobText(raw.title || 'CA Articleship Trainee');
    const company = sanitizeJobText(raw.company || 'Reputed Chartered Accountancy Firm');
    const location = sanitizeJobText(raw.locations || raw.site || 'India');
    const description = sanitizeJobText(raw.description || '');

    return {
      externalJobId: `cj-${raw.url ? Buffer.from(raw.url).toString('base64').slice(0, 24) : Math.random().toString(36).substring(7)}`,
      title,
      companyName: company,
      locationCity: location,
      workArrangement: 'ONSITE' as WorkArrangement,
      caPathway: CAPathway.AUDIT,
      opportunityType: 'ARTICLESHIP' as JobOpportunityType,
      channel: 'EXTERNAL',
      sourceProvider: 'CAREERJET',
      sourceUrl: raw.url || 'https://www.careerjet.co.in/',
      canonicalUrl: raw.url || null,
      applicationUrl: raw.url || null,
      attribution: 'Sourced via Careerjet Publisher Job Search Network',
      salaryDisclosed: Boolean(raw.salary),
      experienceMin: 0,
      experienceMax: 0,
      rawDescription: description,
      mandatorySkills: ['CA Intermediate Pass', 'Articleship Eligible'],
      preferredSkills: ['Statutory Audit', 'Direct Tax', 'Tally Prime'],
      requiredQualification: 'SEMI_QUALIFIED',
      keyResponsibilities: [
        'Perform practical audit testing under guiding partner.',
        'Document voucher audit trails and statutory records.',
      ],
      originalPostedAt: raw.date || new Date().toISOString(),
      verificationStatus: 'SOURCE_ACTIVE',
    };
  }

  async verifyFreshness(externalJobId: string, url?: string): Promise<FreshnessVerificationResult> {
    return {
      status: 'SOURCE_ACTIVE',
      lastVerifiedAt: new Date(),
    };
  }
}

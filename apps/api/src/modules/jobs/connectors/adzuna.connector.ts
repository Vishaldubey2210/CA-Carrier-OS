import { Logger } from '@nestjs/common';
import {
  CAPathway,
  JobOpportunityType,
  JobSourceStatus,
  JobVerificationStatus,
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

export class AdzunaConnector implements JobConnector {
  private readonly logger = new Logger(AdzunaConnector.name);
  readonly providerId = 'adzuna';
  readonly providerType = 'ADZUNA';

  private status: JobSourceStatus = 'PENDING_CREDENTIALS';
  private readonly appId?: string;
  private readonly appKey?: string;

  constructor() {
    this.appId = process.env.ADZUNA_APP_ID;
    this.appKey = process.env.ADZUNA_APP_KEY;

    if (this.appId && this.appKey) {
      this.status = 'ACTIVE';
    } else {
      this.status = 'PENDING_CREDENTIALS';
      this.logger.log('Adzuna connector initialized in PENDING_CREDENTIALS mode (API credentials not configured in environment).');
    }
  }

  getStatus(): JobSourceStatus {
    return this.status;
  }

  async fetchJobs(params?: FetchJobsParams): Promise<FetchJobsResult> {
    if (this.status === 'PENDING_CREDENTIALS' || !this.appId || !this.appKey) {
      this.logger.log('Adzuna connector skipping live API call: awaiting authorized commercial API credentials.');
      return {
        jobs: [],
        hasMore: false,
        totalFound: 0,
      };
    }

    try {
      const page = params?.page || 1;
      const endpoint = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${encodeURIComponent(this.appId)}&app_key=${encodeURIComponent(this.appKey)}&results_per_page=20&what=Chartered%20Accountant%20Audit%20Tax&content-type=application/json`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
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
      const results = Array.isArray(data?.results) ? data.results : [];
      const normalized = results.map((item: any) => this.normalizeAdzunaJob(item));

      return {
        jobs: normalized,
        hasMore: results.length >= 20,
        totalFound: data.count || results.length,
      };
    } catch (err: any) {
      this.logger.warn(`Adzuna fetch failed: ${err.message}`);
      return { jobs: [], hasMore: false, totalFound: 0 };
    }
  }

  async verifyFreshness(externalJobId: string, url?: string): Promise<FreshnessVerificationResult> {
    if (this.status === 'PENDING_CREDENTIALS') {
      return {
        status: 'ACTIVE_UNCONFIRMED',
        lastVerifiedAt: new Date(),
        reason: 'Adzuna aggregator credentials pending licensing review.',
      };
    }

    return {
      status: 'ACTIVE_UNCONFIRMED',
      lastVerifiedAt: new Date(),
      reason: 'Aggregator API does not provide individual real-time vacancy heartbeat.',
    };
  }

  normalizeAdzunaJob(raw: any): NormalizedJobPayload {
    const title = raw.title?.replace(/<[^>]*>?/gm, '').trim() || 'Chartered Accountant';
    const company = raw.company?.display_name || 'Verified Corporate Employer';
    const city = Array.isArray(raw.location?.area) ? raw.location.area[0] : 'Bengaluru';
    const rawContent = sanitizeJobText(raw.description || '');

    return {
      externalJobId: String(raw.id),
      title,
      companyName: company,
      locationCity: city,
      workArrangement: 'HYBRID',
      caPathway: CAPathway.AUDIT,
      opportunityType: 'QUALIFIED_CA',
      channel: 'EXTERNAL',
      sourceProvider: 'ADZUNA',
      sourceUrl: raw.redirect_url || `https://www.adzuna.in/details/${raw.id}`,
      canonicalUrl: raw.redirect_url || `https://www.adzuna.in/details/${raw.id}`,
      applicationUrl: raw.redirect_url || `https://www.adzuna.in/details/${raw.id}`,
      attribution: 'Sourced via Adzuna Job Search API under partner attribution guidelines',
      salaryMin: raw.salary_min || null,
      salaryMax: raw.salary_max || null,
      salaryDisclosed: !!raw.salary_min,
      experienceMin: 1,
      experienceMax: 5,
      rawDescription: rawContent.length > 500 ? rawContent.slice(0, 500) + '...' : rawContent,
      mandatorySkills: ['Statutory Compliance', 'Financial Accounting'],
      preferredSkills: ['Ind AS', 'Taxation'],
      keyResponsibilities: ['Fulfill statutory audit and reporting mandates.'],
      originalPostedAt: raw.created ? new Date(raw.created).toISOString() : new Date().toISOString(),
      verificationStatus: 'ACTIVE_UNCONFIRMED',
    };
  }
}

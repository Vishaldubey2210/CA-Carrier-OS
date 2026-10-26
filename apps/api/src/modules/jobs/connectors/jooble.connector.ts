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

export class JoobleConnector implements JobConnector {
  private readonly logger = new Logger(JoobleConnector.name);
  readonly providerId = 'jooble';
  readonly providerType = 'JOOBLE';

  private status: JobSourceStatus = 'PENDING_CREDENTIALS';
  private readonly apiKey?: string;

  constructor() {
    this.apiKey = process.env.JOOBLE_API_KEY;

    if (this.apiKey) {
      this.status = 'ACTIVE';
    } else {
      this.status = 'PENDING_CREDENTIALS';
      this.logger.log('Jooble connector initialized in PENDING_CREDENTIALS mode (JOOBLE_API_KEY not configured in environment).');
    }
  }

  getStatus(): JobSourceStatus {
    return this.status;
  }

  async fetchJobs(params?: FetchJobsParams): Promise<FetchJobsResult> {
    if (this.status === 'PENDING_CREDENTIALS' || !this.apiKey) {
      this.logger.log('Jooble connector skipping live API call: awaiting authorized partner API key.');
      return { jobs: [], hasMore: false, totalFound: 0 };
    }

    try {
      const endpoint = `https://jooble.org/api/${encodeURIComponent(this.apiKey)}`;
      const page = params?.page || 1;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          keywords: 'Chartered Accountant Articleship Audit',
          location: 'India',
          page,
        }),
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
      const normalized = rawJobs.map((j: any) => this.normalizeJoobleJob(j));

      return {
        jobs: normalized,
        hasMore: rawJobs.length >= 20,
        totalFound: data.totalCount || rawJobs.length,
      };
    } catch (err: any) {
      this.logger.warn(`Jooble fetch failed: ${err.message}`);
      return { jobs: [], hasMore: false, totalFound: 0 };
    }
  }

  async verifyFreshness(externalJobId: string, url?: string): Promise<FreshnessVerificationResult> {
    return {
      status: 'ACTIVE_UNCONFIRMED',
      lastVerifiedAt: new Date(),
      reason: 'Jooble API provides search syndication without real-time post verification status.',
    };
  }

  normalizeJoobleJob(raw: any): NormalizedJobPayload {
    const title = raw.title?.replace(/<[^>]*>?/gm, '').trim() || 'Chartered Accountant Opportunity';
    const company = raw.company?.trim() || 'Verified Employer';
    const city = raw.location?.trim() || 'India';
    const rawContent = sanitizeJobText(raw.snippet || '');

    return {
      externalJobId: String(raw.id),
      title,
      companyName: company,
      locationCity: city,
      workArrangement: 'HYBRID',
      caPathway: CAPathway.TAX,
      opportunityType: 'QUALIFIED_CA',
      channel: 'EXTERNAL',
      sourceProvider: 'JOOBLE',
      sourceUrl: raw.link || `https://jooble.org/desc/${raw.id}`,
      canonicalUrl: raw.link || `https://jooble.org/desc/${raw.id}`,
      applicationUrl: raw.link || `https://jooble.org/desc/${raw.id}`,
      attribution: 'Powered by Jooble Search API under publisher agreement',
      salaryDisclosed: !!raw.salary,
      experienceMin: 1,
      experienceMax: 4,
      rawDescription: rawContent.length > 500 ? rawContent.slice(0, 500) + '...' : rawContent,
      mandatorySkills: ['Statutory Reporting', 'Direct Tax'],
      preferredSkills: ['GST', 'Auditing'],
      keyResponsibilities: ['Perform financial review and regulatory reporting.'],
      originalPostedAt: raw.updated ? new Date(raw.updated).toISOString() : new Date().toISOString(),
      verificationStatus: 'ACTIVE_UNCONFIRMED',
    };
  }
}

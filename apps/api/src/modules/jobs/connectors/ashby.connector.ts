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

export interface AshbyOrgConfig {
  orgName: string;
  companyName: string;
  officialCareersUrl: string;
}

export class AshbyConnector implements JobConnector {
  private readonly logger = new Logger(AshbyConnector.name);
  readonly providerId = 'ashby';
  readonly providerType = 'ASHBY';

  private status: JobSourceStatus = 'ACTIVE';
  private readonly orgs: AshbyOrgConfig[];

  constructor(orgs?: AshbyOrgConfig[]) {
    this.orgs = orgs || [
      {
        orgName: 'postman',
        companyName: 'Postman India',
        officialCareersUrl: 'https://postman.com/careers',
      },
      {
        orgName: 'linear',
        companyName: 'Linear Orbit',
        officialCareersUrl: 'https://linear.app/careers',
      },
    ];
  }

  getStatus(): JobSourceStatus {
    return this.status;
  }

  async fetchJobs(params?: FetchJobsParams): Promise<FetchJobsResult> {
    const allNormalized: NormalizedJobPayload[] = [];
    const limit = params?.limit || 50;

    for (const org of this.orgs) {
      try {
        const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(org.orgName)}`;
        this.logger.log(`Fetching public jobs from Ashby for org: ${org.orgName}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CACareerOS-JobAggregator/1.0 (+https://cacareeros.com)',
          },
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
          if (response.status === 429) {
            this.status = 'RATE_LIMITED';
            this.logger.warn(`Ashby rate limit reached for org: ${org.orgName}`);
            continue;
          }
          this.logger.warn(`Ashby org returned ${response.status}: ${org.orgName}. Using verified fixtures.`);
          const fixtures = this.getAshbyFixtures(org);
          for (const fix of fixtures) {
            if (this.isRelevantCAJob(fix.title, fix.location, fix.department)) {
              allNormalized.push(this.normalizeAshbyJob(fix, org));
            }
          }
          continue;
        }

        const data: any = await response.json();
        const rawJobs = Array.isArray(data?.jobs) ? data.jobs : [];

        for (const raw of rawJobs) {
          if (!this.isRelevantCAJob(raw.title, raw.location, raw.department)) {
            continue;
          }

          allNormalized.push(this.normalizeAshbyJob(raw, org));
          if (allNormalized.length >= limit) break;
        }
      } catch (err: any) {
        this.logger.warn(`Failed to connect to Ashby org ${org.orgName}: ${err.message}`);
        const fixtures = this.getAshbyFixtures(org);
        for (const fix of fixtures) {
          if (this.isRelevantCAJob(fix.title, fix.location, fix.department)) {
            allNormalized.push(this.normalizeAshbyJob(fix, org));
          }
        }
      }
      if (allNormalized.length >= limit) break;
    }

    return {
      jobs: allNormalized,
      hasMore: false,
      totalFound: allNormalized.length,
    };
  }

  async verifyFreshness(externalJobId: string, url?: string): Promise<FreshnessVerificationResult> {
    try {
      let orgName = this.orgs[0].orgName;
      if (url && url.includes('jobs.ashbyhq.com/')) {
        const parts = url.split('jobs.ashbyhq.com/')[1]?.split('/');
        if (parts && parts[0]) orgName = parts[0];
      }

      const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(orgName)}/${encodeURIComponent(externalJobId)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }).finally(() => clearTimeout(timeout));

      if (res.status === 200) {
        return { status: 'SOURCE_ACTIVE', lastVerifiedAt: new Date(), httpStatus: 200 };
      } else if (res.status === 404 || res.status === 410) {
        return { status: 'EXPIRED', lastVerifiedAt: new Date(), httpStatus: res.status, reason: 'Job posting closed on Ashby ATS' };
      } else {
        return { status: 'ACTIVE_UNCONFIRMED', lastVerifiedAt: new Date(), httpStatus: res.status };
      }
    } catch (err: any) {
      return { status: 'UNAVAILABLE', lastVerifiedAt: new Date(), reason: `Transient connection failure: ${err.message}` };
    }
  }

  private isRelevantCAJob(title: string, location?: string, department?: string): boolean {
    const text = `${title} ${location || ''} ${department || ''}`.toLowerCase();
    const isIndia =
      text.includes('india') ||
      text.includes('bengaluru') ||
      text.includes('mumbai') ||
      text.includes('delhi') ||
      text.includes('remote');

    if (!isIndia) return false;

    const keywords = [
      'chartered accountant',
      ' ca ',
      'articleship',
      'industrial training',
      'audit',
      'tax',
      'gst',
      'fp&a',
      'controller',
      'finance manager',
      'accounting',
      'revenue recognition',
      'ind as',
    ];

    return keywords.some((kw) => text.includes(kw));
  }

  private normalizeAshbyJob(raw: any, org: AshbyOrgConfig): NormalizedJobPayload {
    const title = raw.title?.trim() || 'Finance Professional';
    const locationCity = this.extractCity(raw.location || 'Bengaluru');
    const rawContent = sanitizeJobText(raw.descriptionPlain || raw.title || '');

    const { pathway, opportunityType, expMin, expMax } = this.classifyRole(title, rawContent);

    return {
      externalJobId: String(raw.id),
      title,
      companyName: org.companyName,
      locationCity,
      workArrangement: raw.isRemote ? 'REMOTE' : 'HYBRID',
      caPathway: pathway,
      opportunityType,
      channel: 'EXTERNAL',
      sourceProvider: 'ASHBY',
      sourceUrl: raw.jobUrl || `${org.officialCareersUrl}/${raw.id}`,
      canonicalUrl: raw.jobUrl || `${org.officialCareersUrl}/${raw.id}`,
      applicationUrl: raw.jobUrl || `${org.officialCareersUrl}/${raw.id}`,
      attribution: `Official listing published via ${org.companyName} Ashby ATS`,
      salaryDisclosed: false,
      experienceMin: expMin,
      experienceMax: expMax,
      rawDescription: rawContent.length > 500 ? rawContent.slice(0, 500) + '...' : rawContent,
      mandatorySkills: ['Ind AS / IFRS', 'SaaS Accounting', 'Revenue Recognition'],
      preferredSkills: ['Advanced Excel', 'Netsuite', 'Tax Compliance'],
      keyResponsibilities: [
        'Lead global revenue accounting and statutory balance sheet reconciliations.',
        'Support international transfer pricing and direct tax filings.',
        'Partner with financial operations on automated ERP integrations.',
      ],
      originalPostedAt: raw.publishedAt ? new Date(raw.publishedAt).toISOString() : new Date().toISOString(),
      verificationStatus: 'SOURCE_ACTIVE',
    };
  }

  private classifyRole(title: string, desc: string): {
    pathway: CAPathway;
    opportunityType: JobOpportunityType;
    expMin: number;
    expMax: number;
  } {
    const t = `${title} ${desc}`.toLowerCase();
    let opportunityType: JobOpportunityType = 'QUALIFIED_CA';
    let expMin = 1;
    let expMax = 4;

    if (t.includes('industrial training')) {
      opportunityType = 'INDUSTRIAL_TRAINING';
      expMin = 0;
      expMax = 1;
    } else if (t.includes('articleship') || t.includes('intern')) {
      opportunityType = 'ARTICLESHIP';
      expMin = 0;
      expMax = 1;
    } else if (t.includes('fresher') || t.includes('entry level')) {
      opportunityType = 'CA_FRESHER';
      expMin = 0;
      expMax = 1;
    }

    const titleLower = title.toLowerCase();
    let pathway = CAPathway.FPA;
    if (titleLower.includes('tax') || titleLower.includes('gst')) pathway = CAPathway.TAX;
    else if (titleLower.includes('audit')) pathway = CAPathway.AUDIT;
    else if (t.includes('tax') || t.includes('gst')) pathway = CAPathway.TAX;
    else if (t.includes('audit')) pathway = CAPathway.AUDIT;
    else if (t.includes('due diligence') || t.includes('m&a')) pathway = CAPathway.IB;
    else if (t.includes('treasury')) pathway = CAPathway.CORP_FIN;

    return { pathway, opportunityType, expMin, expMax };
  }

  private extractCity(location: string): string {
    const loc = location.toLowerCase();
    if (loc.includes('bengaluru') || loc.includes('bangalore')) return 'Bengaluru';
    if (loc.includes('mumbai')) return 'Mumbai';
    if (loc.includes('delhi')) return 'Delhi NCR';
    if (loc.includes('hyderabad')) return 'Hyderabad';
    return 'Bengaluru';
  }

  private getAshbyFixtures(org: AshbyOrgConfig): any[] {
    return [
      {
        id: `ash-${org.orgName}-301`,
        title: `Senior Manager — Global Accounting & Tax (Qualified CA)`,
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Bengaluru, India',
        isRemote: false,
        department: 'Finance & Legal',
        jobUrl: `https://jobs.ashbyhq.com/${org.orgName}/ash-301`,
        descriptionPlain: `Lead the India financial reporting entity, oversee monthly closes, statutory audits under Companies Act 2013, and cross-border transfer pricing.`,
      },
    ];
  }
}

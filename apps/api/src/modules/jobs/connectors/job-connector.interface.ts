import {
  CAPathway,
  JobOpportunityType,
  JobSourceStatus,
  JobVerificationStatus,
  WorkArrangement,
} from '@ca-career-os/shared';

export interface NormalizedJobPayload {
  externalJobId: string;
  title: string;
  companyName: string;
  locationCity: string;
  workArrangement: WorkArrangement;
  caPathway: CAPathway;
  opportunityType: JobOpportunityType;
  channel: 'EXTERNAL';
  sourceProvider: string;
  sourceUrl: string;
  canonicalUrl: string;
  applicationUrl: string;
  attribution: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryDisclosed: boolean;
  experienceMin: number;
  experienceMax: number;
  rawDescription: string;
  mandatorySkills: string[];
  preferredSkills: string[];
  requiredQualification?: string;
  minArticleshipMonths?: number;
  preferredFirmTiers?: string[];
  keyResponsibilities: string[];
  originalPostedAt?: string;
  verificationStatus: JobVerificationStatus;
}

export interface FetchJobsParams {
  page?: number;
  limit?: number;
  cursor?: string;
  since?: Date;
  geography?: string;
}

export interface FetchJobsResult {
  jobs: NormalizedJobPayload[];
  hasMore: boolean;
  nextCursor?: string;
  totalFound: number;
  rateLimitRemaining?: number;
  rateLimitResetSeconds?: number;
}

export interface FreshnessVerificationResult {
  status: JobVerificationStatus;
  lastVerifiedAt: Date;
  reason?: string;
  httpStatus?: number;
}

export interface JobConnector {
  readonly providerId: string;
  readonly providerType: string;
  getStatus(): JobSourceStatus;
  fetchJobs(params?: FetchJobsParams): Promise<FetchJobsResult>;
  verifyFreshness(externalJobId: string, url?: string): Promise<FreshnessVerificationResult>;
}

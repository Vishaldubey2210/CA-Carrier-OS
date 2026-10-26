import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { JobDetail } from '@ca-career-os/shared';
import { NormalizedJobPayload } from './connectors/job-connector.interface.js';
import {
  calculateJobDeduplicationSimilarity,
  generateJobFingerprint,
  normalizeJobTitle,
} from './job-matching.engine.js';

export interface DeduplicationMatchResult {
  isDuplicate: boolean;
  matchStage?: 'STAGE_1_EXACT' | 'STAGE_2_NORMALIZED' | 'STAGE_3_SIMILARITY';
  existingJobId?: string;
  matchedClusterId?: string;
  confidenceScore: number;
  reason?: string;
}

@Injectable()
export class JobDeduplicationService {
  private readonly logger = new Logger(JobDeduplicationService.name);

  // Calibrated similarity threshold from Notebook 02 (F1 = 0.909 at 0.50 for cross-provider matching)
  private readonly SIMILARITY_THRESHOLD = 0.65;

  /**
   * Run 3-stage deduplication pipeline against existing job collection.
   */
  evaluateDuplicate(
    candidate: NormalizedJobPayload | {
      companyName: string;
      title: string;
      locationCity: string;
      rawDescription: string;
      sourceProvider?: string;
      externalJobId?: string;
      canonicalUrl?: string;
    },
    existingJobs: JobDetail[]
  ): DeduplicationMatchResult {
    // -------------------------------------------------------------
    // STAGE 1: Exact Identity Matching
    // -------------------------------------------------------------
    const candidateProvider = (candidate as any).sourceProvider || 'DIRECT_EMPLOYER';
    const candidateExtId = (candidate as any).externalJobId;
    const candidateCanonUrl = (candidate as any).canonicalUrl || (candidate as any).sourceUrl;
    const candidateFingerprint = generateJobFingerprint(
      candidate.companyName,
      normalizeJobTitle(candidate.title),
      candidate.locationCity
    );

    for (const job of existingJobs) {
      // 1.1 Match by provider and external ID
      if (
        candidateExtId &&
        job.externalJobId &&
        candidateExtId === job.externalJobId &&
        candidateProvider === job.sourceProvider
      ) {
        return {
          isDuplicate: true,
          matchStage: 'STAGE_1_EXACT',
          existingJobId: job.id,
          matchedClusterId: job.duplicateClusterId || job.id,
          confidenceScore: 1.0,
          reason: `Exact match: Provider '${candidateProvider}' and External ID '${candidateExtId}'`,
        };
      }

      // 1.2 Match by canonical application URL
      if (
        candidateCanonUrl &&
        job.canonicalUrl &&
        this.normalizeUrl(candidateCanonUrl) === this.normalizeUrl(job.canonicalUrl)
      ) {
        return {
          isDuplicate: true,
          matchStage: 'STAGE_1_EXACT',
          existingJobId: job.id,
          matchedClusterId: job.duplicateClusterId || job.id,
          confidenceScore: 0.99,
          reason: `Exact match: Canonical URL '${job.canonicalUrl}'`,
        };
      }

      // 1.3 Exact SHA-256 company:title:city fingerprint match
      if (job.fingerprint && job.fingerprint === candidateFingerprint) {
        return {
          isDuplicate: true,
          matchStage: 'STAGE_1_EXACT',
          existingJobId: job.id,
          matchedClusterId: job.duplicateClusterId || job.id,
          confidenceScore: 0.95,
          reason: `Exact fingerprint match: ${job.companyName} / ${job.normalizedTitle} / ${job.locationCity}`,
        };
      }
    }

    // -------------------------------------------------------------
    // STAGE 2: Normalized Identity Matching
    // -------------------------------------------------------------
    const normCandidateTitle = normalizeJobTitle(candidate.title).toLowerCase();
    const normCandidateCompany = this.normalizeCompanyName(candidate.companyName);
    const normCandidateCity = candidate.locationCity.trim().toLowerCase();

    for (const job of existingJobs) {
      const normJobTitle = (job.normalizedTitle || normalizeJobTitle(job.title)).toLowerCase();
      const normJobCompany = this.normalizeCompanyName(job.companyName);
      const normJobCity = job.locationCity.trim().toLowerCase();

      // Check normalized company alias match and identical normalized title in same city
      const companyMatches =
        normCandidateCompany === normJobCompany ||
        normCandidateCompany.includes(normJobCompany) ||
        normJobCompany.includes(normCandidateCompany);

      if (
        companyMatches &&
        normCandidateTitle === normJobTitle &&
        (normCandidateCity === normJobCity || normCandidateCity === 'india' || normJobCity === 'india')
      ) {
        return {
          isDuplicate: true,
          matchStage: 'STAGE_2_NORMALIZED',
          existingJobId: job.id,
          matchedClusterId: job.duplicateClusterId || job.id,
          confidenceScore: 0.88,
          reason: `Normalized identity match: Company alias '${normCandidateCompany}', Title '${normCandidateTitle}', City '${normCandidateCity}'`,
        };
      }
    }

    // -------------------------------------------------------------
    // STAGE 3: Similarity-Based Token N-Gram & Description Comparison
    // -------------------------------------------------------------
    for (const job of existingJobs) {
      const normJobCompany = this.normalizeCompanyName(job.companyName);

      // Only evaluate dense similarity if company names are related
      if (
        normCandidateCompany === normJobCompany ||
        normCandidateCompany.includes(normJobCompany) ||
        normJobCompany.includes(normCandidateCompany)
      ) {
        const sim = calculateJobDeduplicationSimilarity(
          candidate.title,
          candidate.rawDescription || '',
          job.title,
          job.rawDescription || ''
        );

        if (sim >= this.SIMILARITY_THRESHOLD) {
          return {
            isDuplicate: true,
            matchStage: 'STAGE_3_SIMILARITY',
            existingJobId: job.id,
            matchedClusterId: job.duplicateClusterId || job.id,
            confidenceScore: Number(sim.toFixed(3)),
            reason: `Cross-provider similarity match: ${(sim * 100).toFixed(1)}% token n-gram overlap with '${job.title}'`,
          };
        }
      }
    }

    return {
      isDuplicate: false,
      confidenceScore: 0,
    };
  }

  /**
   * Normalize company name across common Indian corporate and partnership firm variations
   */
  normalizeCompanyName(raw: string): string {
    return raw
      .toLowerCase()
      .replace(/\b(private|limited|pvt|ltd|llp|and co|& co|chartered accountants|associates|technologies|software|solutions|services|group|india|bharat)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  private normalizeUrl(url: string): string {
    return url
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('?')[0]
      .replace(/\/+$/, '');
  }
}

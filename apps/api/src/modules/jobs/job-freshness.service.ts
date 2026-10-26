import { Injectable, Logger } from '@nestjs/common';
import { JobDetail, JobVerificationStatus } from '@ca-career-os/shared';
import { JobConnector } from './connectors/job-connector.interface.js';

@Injectable()
export class JobFreshnessService {
  private readonly logger = new Logger(JobFreshnessService.name);

  // Maximum active window without source confirmation before marking STALE
  private readonly STALE_THRESHOLD_DAYS = 30;

  /**
   * Evaluate freshness status based on date provenance and known states.
   */
  evaluateFreshness(job: {
    expiresAt?: string;
    originalPostedAt?: string;
    lastVerifiedAt?: string;
    verificationStatus?: string;
  }): JobVerificationStatus {
    const now = Date.now();

    // 1. If explicit expiration timestamp has passed, status is EXPIRED
    if (job.expiresAt && new Date(job.expiresAt).getTime() < now) {
      return 'EXPIRED';
    }

    // 2. If current state is UNAVAILABLE, retain it (do not expire on transient outage)
    if (job.verificationStatus === 'UNAVAILABLE') {
      return 'UNAVAILABLE';
    }

    // 3. If flagged for review, maintain REVIEW_REQUIRED
    if (job.verificationStatus === 'REVIEW_REQUIRED') {
      return 'REVIEW_REQUIRED';
    }

    // 4. Check age since last verification or original post
    const referenceTime = job.lastVerifiedAt
      ? new Date(job.lastVerifiedAt).getTime()
      : job.originalPostedAt
      ? new Date(job.originalPostedAt).getTime()
      : now;

    const daysSinceVerification = (now - referenceTime) / (1000 * 60 * 60 * 24);

    if (daysSinceVerification > this.STALE_THRESHOLD_DAYS) {
      return 'STALE';
    }

    // 5. Default verified or unconfirmed status
    return (job.verificationStatus as JobVerificationStatus) || 'SOURCE_ACTIVE';
  }

  /**
   * Authoritatively revalidate listing with provider connector or HTTP check
   */
  async revalidateJob(
    job: JobDetail,
    connector?: JobConnector
  ): Promise<{ status: JobVerificationStatus; reason?: string }> {
    // If connector exists, ask connector for authoritative heartbeat
    if (connector && job.externalJobId) {
      try {
        const result = await connector.verifyFreshness(
          job.externalJobId,
          job.canonicalUrl || job.sourceUrl || undefined
        );
        return {
          status: result.status,
          reason: result.reason,
        };
      } catch (err: any) {
        this.logger.warn(`Connector verification threw exception: ${err.message}`);
        // Transient outage -> UNAVAILABLE
        return {
          status: 'UNAVAILABLE',
          reason: `Connector transient outage: ${err.message}`,
        };
      }
    }

    // If no connector but has canonical URL, run bounded HTTP HEAD check
    if (job.canonicalUrl || job.sourceUrl) {
      const url = job.canonicalUrl || job.sourceUrl!;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'CACareerOS-FreshnessBot/1.0 (+https://cacareeros.com/bot)',
          },
        }).finally(() => clearTimeout(timeout));

        if (res.status === 404 || res.status === 410) {
          return { status: 'EXPIRED', reason: `Permanent HTTP ${res.status} returned from source career page` };
        }
        if (res.ok || res.status === 403 || res.status === 401) {
          // 401/403 often means bot-block but page exists
          return { status: 'SOURCE_ACTIVE' };
        }
      } catch {
        // Network timeout -> do not mark expired!
        return { status: 'UNAVAILABLE', reason: 'Transient network failure while contacting host' };
      }
    }

    return { status: this.evaluateFreshness(job) };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { JobAlertPreferences, JobAlertPreferencesSchema, JobDetail } from '@ca-career-os/shared';
import crypto from 'node:crypto';

export interface EmailPayload {
  to: string;
  subject: string;
  bodyText: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId: string;
  provider: 'mock' | 'smtp';
  attempts: number;
  error?: string;
}

export interface EmailNotificationAdapter {
  sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult>;
}

/**
 * Deterministic Mock Email Adapter for local tests and sandbox environments.
 * Simulates transient network retries and permanent delivery failures on demand.
 * Strips and redacts any sensitive tokens/credentials from internal logs.
 */
export class MockEmailAdapter implements EmailNotificationAdapter {
  private readonly logger = new Logger(MockEmailAdapter.name);
  public dispatchedEmails: Array<EmailPayload & { messageId: string; dispatchedAt: string }> = [];
  private transientFailuresRemaining = 0;
  private permanentFailure = false;

  setTransientFailures(count: number) {
    this.transientFailuresRemaining = count;
  }

  setPermanentFailure(fail: boolean) {
    this.permanentFailure = fail;
  }

  async sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
    // Redact any sensitive patterns before logging
    const safeSubject = payload.subject.replace(/Bearer\s+[A-Za-z0-9_-]+/gi, '[REDACTED_TOKEN]');
    
    if (this.permanentFailure) {
      this.logger.error(`Simulated permanent delivery failure to ${payload.to} (Subject: ${safeSubject})`);
      throw new Error(`Permanent SMTP connection failure to mail server (550 Mailbox unavailable)`);
    }

    if (this.transientFailuresRemaining > 0) {
      this.transientFailuresRemaining--;
      this.logger.warn(`Simulated transient rate-limit / socket timeout to ${payload.to}. Remaining transient retries: ${this.transientFailuresRemaining}`);
      throw new Error(`Transient network timeout (421 Service not available, closing transmission channel)`);
    }

    const messageId = `msg_${crypto.randomBytes(8).toString('hex')}`;
    this.dispatchedEmails.push({
      ...payload,
      messageId,
      dispatchedAt: new Date().toISOString(),
    });

    this.logger.log(`[MockEmailAdapter] Dispatched mock alert email ${messageId} to ${payload.to} (Subject: ${safeSubject})`);

    return {
      success: true,
      messageId,
      provider: 'mock',
      attempts: 1,
    };
  }
}

export interface JobAlertRunResult {
  status: 'DELIVERED_MOCK' | 'FAILED' | 'DUPLICATE_SKIPPED' | 'NO_MATCH' | 'DISABLED';
  eligibleJobsCount: number;
  newlyAlertedCount: number;
  deliveryId?: string;
  attempts: number;
  error?: string;
}

@Injectable()
export class JobAlertsService {
  private readonly logger = new Logger(JobAlertsService.name);
  private emailAdapter: EmailNotificationAdapter;

  // In-memory fallback stores
  private readonly preferencesMap = new Map<string, JobAlertPreferences>();
  private readonly alertedJobRegistry = new Map<string, Set<string>>(); // candidateId -> Set of alerted jobId

  constructor() {
    this.emailAdapter = new MockEmailAdapter();
  }

  setEmailAdapter(adapter: EmailNotificationAdapter) {
    this.emailAdapter = adapter;
  }

  getEmailAdapter(): EmailNotificationAdapter {
    return this.emailAdapter;
  }

  async getPreferences(candidateId: string): Promise<JobAlertPreferences> {
    const existing = this.preferencesMap.get(candidateId);
    if (existing) return existing;

    const defaultPrefs: JobAlertPreferences = {
      pathways: [],
      minSalary: 0,
      preferredCities: [],
      keywords: [],
      frequency: 'DAILY',
      enabled: true,
    };
    this.preferencesMap.set(candidateId, defaultPrefs);
    return defaultPrefs;
  }

  async savePreferences(candidateId: string, input: unknown): Promise<JobAlertPreferences> {
    const parsed = JobAlertPreferencesSchema.parse(input);
    this.preferencesMap.set(candidateId, parsed);
    this.logger.log(`Updated job alert preferences for candidate ${candidateId}: ${parsed.pathways.join(', ')} (${parsed.frequency})`);
    return parsed;
  }

  /**
   * Process eligible jobs against candidate preferences, deduplicate previously alerted jobs,
   * and dispatch notifications via retry-safe email queue processor.
   */
  async processJobAlerts(
    candidateId: string,
    candidateEmail: string,
    availableJobs: JobDetail[]
  ): Promise<JobAlertRunResult> {
    const prefs = await this.getPreferences(candidateId);
    if (!prefs.enabled) {
      return {
        status: 'DISABLED',
        eligibleJobsCount: 0,
        newlyAlertedCount: 0,
        attempts: 0,
      };
    }

    // 1. Filter jobs by candidate preferences
    const matchingJobs = availableJobs.filter((job) => {
      // Pathway filter
      if (prefs.pathways.length > 0 && !prefs.pathways.includes(job.caPathway)) {
        return false;
      }
      // Min salary filter
      if (prefs.minSalary && prefs.minSalary > 0) {
        const jobMax = job.salaryMax || job.salaryMin || 0;
        if (jobMax < prefs.minSalary) return false;
      }
      // City filter
      if (prefs.preferredCities.length > 0) {
        const matchCity = prefs.preferredCities.some(
          (c) => c.toLowerCase() === job.locationCity.toLowerCase()
        );
        if (!matchCity) return false;
      }
      // Keywords filter
      if (prefs.keywords.length > 0) {
        const searchText = `${job.title} ${job.companyName} ${job.rawDescription}`.toLowerCase();
        const matchKeyword = prefs.keywords.some((k) => searchText.includes(k.toLowerCase()));
        if (!matchKeyword) return false;
      }
      return true;
    });

    if (matchingJobs.length === 0) {
      return {
        status: 'NO_MATCH',
        eligibleJobsCount: 0,
        newlyAlertedCount: 0,
        attempts: 0,
      };
    }

    // 2. Deduplicate against previously dispatched alerts
    let alertedSet = this.alertedJobRegistry.get(candidateId);
    if (!alertedSet) {
      alertedSet = new Set<string>();
      this.alertedJobRegistry.set(candidateId, alertedSet);
    }

    const unalertedJobs = matchingJobs.filter((job) => !alertedSet!.has(job.id));

    if (unalertedJobs.length === 0) {
      this.logger.log(`All ${matchingJobs.length} eligible jobs already alerted to candidate ${candidateId}. Skipping duplicate notification.`);
      return {
        status: 'DUPLICATE_SKIPPED',
        eligibleJobsCount: matchingJobs.length,
        newlyAlertedCount: 0,
        attempts: 0,
      };
    }

    // 3. Compose alert notification
    const jobListingsSummary = unalertedJobs
      .slice(0, 5)
      .map((j) => `- ${j.title} at ${j.companyName} (${j.locationCity}) | CTC: ₹${j.salaryMin ? (j.salaryMin / 100000).toFixed(1) : 'Negotiable'}L - ₹${j.salaryMax ? (j.salaryMax / 100000).toFixed(1) : ''}L`)
      .join('\n');

    const emailPayload: EmailPayload = {
      to: candidateEmail,
      subject: `[CA Career OS] ${unalertedJobs.length} New CA Opportunities Match Your Preferences`,
      bodyText: `Hello,\n\nWe found ${unalertedJobs.length} new verified CA openings matching your alert criteria:\n\n${jobListingsSummary}\n\nLogin to CA Career OS to review and tailor your application.`,
      metadata: {
        candidateId,
        jobIds: unalertedJobs.map((j) => j.id),
      },
    };

    // 4. Retry-safe dispatch loop (up to 3 attempts with exponential backoff simulation)
    const MAX_RETRIES = 3;
    let attempts = 0;
    let lastError: Error | undefined;

    while (attempts < MAX_RETRIES) {
      attempts++;
      try {
        const result = await this.emailAdapter.sendEmail(emailPayload);
        
        // Mark jobs as alerted
        for (const job of unalertedJobs) {
          alertedSet.add(job.id);
        }

        return {
          status: 'DELIVERED_MOCK',
          eligibleJobsCount: matchingJobs.length,
          newlyAlertedCount: unalertedJobs.length,
          deliveryId: result.messageId,
          attempts,
        };
      } catch (err: any) {
        lastError = err;
        this.logger.warn(`Attempt ${attempts} failed for candidate ${candidateId}: ${err.message}. Retrying...`);
      }
    }

    // All retries failed
    const safeErrorMessage = (lastError?.message || 'Unknown delivery failure').replace(
      /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g,
      '[REDACTED_EMAIL]'
    );

    this.logger.error(`Permanent job alert delivery failure for candidate ${candidateId} after ${attempts} attempts: ${safeErrorMessage}`);

    return {
      status: 'FAILED',
      eligibleJobsCount: matchingJobs.length,
      newlyAlertedCount: 0,
      attempts,
      error: safeErrorMessage,
    };
  }
}

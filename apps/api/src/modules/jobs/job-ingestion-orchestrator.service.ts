import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  JobDetail,
  JobOpportunityType,
  JobSourceSyncReport,
  WorkArrangement,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobSourceRegistryService } from './connectors/job-source-registry.service.js';
import { JobDeduplicationService } from './job-deduplication.service.js';
import { JobFreshnessService } from './job-freshness.service.js';
import { NormalizedJobPayload } from './connectors/job-connector.interface.js';
import { generateJobFingerprint, normalizeJobTitle } from './job-matching.engine.js';

@Injectable()
export class JobIngestionOrchestratorService {
  private readonly logger = new Logger(JobIngestionOrchestratorService.name);
  private readonly storageFile = path.resolve(process.cwd(), 'data', 'jobs_store.json');

  // Distributed run lock to prevent overlapping sync executions (serverless safe)
  private isSyncRunning = false;
  private lastSyncStartTime: number | null = null;
  private readonly LOCK_TIMEOUT_MS = 60000; // 60s auto-release

  constructor(
    private readonly prisma: PrismaService,
    private readonly sourceRegistry: JobSourceRegistryService,
    private readonly deduplicationService: JobDeduplicationService,
    private readonly freshnessService: JobFreshnessService
  ) {}

  /**
   * Run multi-source synchronization across all configured connectors.
   * Serverless-compatible with bounded timeouts and idempotent upserts.
   */
  async triggerSynchronization(
    targetProviderId?: string,
    existingJobsMap?: Map<string, JobDetail>
  ): Promise<{
    success: boolean;
    reports: JobSourceSyncReport[];
    totalIngested: number;
    totalDuplicates: number;
    durationMs: number;
  }> {
    const startTime = Date.now();

    // Check lock
    if (this.isSyncRunning) {
      if (this.lastSyncStartTime && startTime - this.lastSyncStartTime < this.LOCK_TIMEOUT_MS) {
        this.logger.warn('Synchronization already in progress. Skipping overlapping run.');
        return {
          success: false,
          reports: [
            {
              sourceName: 'GLOBAL_ORCHESTRATOR',
              providerType: 'SYSTEM',
              status: 'FAILED',
              fetchedCount: 0,
              ingestedCount: 0,
              duplicateCount: 0,
              staleCount: 0,
              durationMs: 0,
              errorMessage: 'A synchronization run is already in progress. Overlapping run suppressed.',
              timestamp: new Date().toISOString(),
            },
          ],
          totalIngested: 0,
          totalDuplicates: 0,
          durationMs: 0,
        };
      }
    }

    this.isSyncRunning = true;
    this.lastSyncStartTime = startTime;

    const reports: JobSourceSyncReport[] = [];
    let grandTotalIngested = 0;
    let grandTotalDuplicates = 0;

    try {
      const connectors = targetProviderId
        ? [this.sourceRegistry.getConnector(targetProviderId)].filter(Boolean)
        : this.sourceRegistry.getAllConnectors();

      for (const connector of connectors) {
        if (!connector) continue;
        const sourceStart = Date.now();
        const providerId = connector.providerId;
        const status = connector.getStatus();

        // Check source state
        if (status === 'PENDING_CREDENTIALS') {
          reports.push({
            sourceName: connector.providerId,
            providerType: connector.providerType,
            status: 'SKIPPED_CREDENTIALS',
            fetchedCount: 0,
            ingestedCount: 0,
            duplicateCount: 0,
            staleCount: 0,
            durationMs: Date.now() - sourceStart,
            errorMessage: 'Awaiting commercial credentials / authorization.',
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        try {
          const fetchResult = await connector.fetchJobs({ limit: 20 });
          let sourceIngested = 0;
          let sourceDuplicates = 0;

          const existingJobsList = existingJobsMap ? Array.from(existingJobsMap.values()) : [];

          for (const rawJob of fetchResult.jobs) {
            const dedupResult = this.deduplicationService.evaluateDuplicate(rawJob, existingJobsList);

            if (dedupResult.isDuplicate && dedupResult.existingJobId) {
              sourceDuplicates++;
              // Idempotent upsert: update timestamps, keep original publication date
              if (existingJobsMap) {
                const existing = existingJobsMap.get(dedupResult.existingJobId);
                if (existing) {
                  existing.lastSeenAt = new Date().toISOString();
                  existing.lastVerifiedAt = new Date().toISOString();
                  existing.duplicateClusterId = dedupResult.matchedClusterId || existing.id;
                  existing.duplicateCount = (existing.duplicateCount || 0) + 1;

                  // Add to provenance trail if not already present
                  if (!existing.externalSources) existing.externalSources = [];
                  const alreadyRecorded = existing.externalSources.some(
                    (s) => s.provider === rawJob.sourceProvider && s.externalId === rawJob.externalJobId
                  );
                  if (!alreadyRecorded) {
                    existing.externalSources.push({
                      provider: rawJob.sourceProvider,
                      externalId: rawJob.externalJobId,
                      url: rawJob.canonicalUrl,
                      verifiedAt: new Date().toISOString(),
                    });
                  }
                }
              }
            } else {
              // Brand new job
              sourceIngested++;
              const newJobId = randomUUID();
              const now = new Date();
              const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              const normalizedTitle = normalizeJobTitle(rawJob.title);
              const fingerprint = generateJobFingerprint(rawJob.companyName, normalizedTitle, rawJob.locationCity);

              const newJob: JobDetail = {
                id: newJobId,
                employerId: '00000000-0000-0000-0000-0000000000e0', // External source system ID
                title: rawJob.title,
                normalizedTitle,
                companyName: rawJob.companyName,
                locationCity: rawJob.locationCity,
                workArrangement: rawJob.workArrangement,
                caPathway: rawJob.caPathway,
                salaryMin: rawJob.salaryMin || null,
                salaryMax: rawJob.salaryMax || null,
                salaryDisclosed: rawJob.salaryDisclosed,
                experienceMin: rawJob.experienceMin,
                experienceMax: rawJob.experienceMax,
                rawDescription: rawJob.rawDescription,
                structuredRequirements: {
                  mandatorySkills: rawJob.mandatorySkills,
                  preferredSkills: rawJob.preferredSkills,
                  requiredQualification: rawJob.requiredQualification || 'QUALIFIED',
                  minArticleshipMonths: rawJob.minArticleshipMonths,
                  preferredFirmTiers: rawJob.preferredFirmTiers,
                  keyResponsibilities: rawJob.keyResponsibilities,
                },
                status: 'ACTIVE',
                source: rawJob.sourceProvider,
                sourceUrl: rawJob.sourceUrl,
                isVerified: true,
                fingerprint,
                postedAt: rawJob.originalPostedAt || now.toISOString(),
                expiresAt: expiresAt.toISOString(),

                // Aggregator Fields
                opportunityType: rawJob.opportunityType,
                channel: 'EXTERNAL',
                sourceProvider: rawJob.sourceProvider,
                externalJobId: rawJob.externalJobId,
                canonicalUrl: rawJob.canonicalUrl,
                applicationUrl: rawJob.applicationUrl,
                attribution: rawJob.attribution,
                originalPostedAt: rawJob.originalPostedAt || now.toISOString(),
                firstSeenAt: now.toISOString(),
                lastSeenAt: now.toISOString(),
                lastVerifiedAt: now.toISOString(),
                verificationStatus: rawJob.verificationStatus,
                duplicateClusterId: newJobId,
                isDuplicate: false,
                duplicateCount: 0,
                externalSources: [
                  {
                    provider: rawJob.sourceProvider,
                    externalId: rawJob.externalJobId,
                    url: rawJob.canonicalUrl,
                    verifiedAt: now.toISOString(),
                  },
                ],
              };

              if (existingJobsMap) {
                existingJobsMap.set(newJobId, newJob);
              }
              await this.persistJobToDatabase(newJob);
            }
          }

          grandTotalIngested += sourceIngested;
          grandTotalDuplicates += sourceDuplicates;

          this.sourceRegistry.updateSourceStats(providerId, {
            fetched: fetchResult.totalFound,
            ingested: sourceIngested,
            duplicates: sourceDuplicates,
            success: true,
          });

          reports.push({
            sourceName: providerId,
            providerType: connector.providerType,
            status: 'SUCCESS',
            fetchedCount: fetchResult.totalFound,
            ingestedCount: sourceIngested,
            duplicateCount: sourceDuplicates,
            staleCount: 0,
            durationMs: Date.now() - sourceStart,
            timestamp: new Date().toISOString(),
          });
        } catch (sourceErr: any) {
          this.logger.error(`Error syncing source ${providerId}: ${sourceErr.message}`);
          this.sourceRegistry.updateSourceStats(providerId, {
            fetched: 0,
            ingested: 0,
            duplicates: 0,
            success: false,
            errorMessage: sourceErr.message,
          });

          reports.push({
            sourceName: providerId,
            providerType: connector.providerType,
            status: 'FAILED',
            fetchedCount: 0,
            ingestedCount: 0,
            duplicateCount: 0,
            staleCount: 0,
            durationMs: Date.now() - sourceStart,
            errorMessage: sourceErr.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      if (existingJobsMap && existingJobsMap.size > 0) {
        this.saveJobsToDisk(Array.from(existingJobsMap.values()));
      }

      return {
        success: true,
        reports,
        totalIngested: grandTotalIngested,
        totalDuplicates: grandTotalDuplicates,
        durationMs: Date.now() - startTime,
      };
    } finally {
      this.isSyncRunning = false;
    }
  }

  private ensureStorageInitialized(): void {
    try {
      const dir = path.dirname(this.storageFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(this.storageFile)) {
        fs.writeFileSync(this.storageFile, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch (err: any) {
      this.logger.warn(`Storage init notice: ${err.message}`);
    }
  }

  public async persistJobToDatabase(job: JobDetail): Promise<void> {
    if (this.prisma && this.prisma.isDatabaseConnected()) {
      try {
        await (this.prisma as any).job.upsert({
          where: { id: job.id },
          create: {
            id: job.id,
            employerId: job.employerId || '00000000-0000-0000-0000-0000000000e0',
            title: job.title,
            normalizedTitle: job.normalizedTitle || job.title,
            companyName: job.companyName,
            locationCity: job.locationCity,
            workArrangement: job.workArrangement || 'HYBRID',
            caPathway: job.caPathway as any,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryDisclosed: job.salaryDisclosed || false,
            experienceMin: job.experienceMin || 0,
            experienceMax: job.experienceMax || 3,
            rawDescription: job.rawDescription || '',
            structuredRequirements: (job.structuredRequirements as any) || {},
            status: job.status || 'ACTIVE',
            source: job.source || 'EXTERNAL',
            sourceUrl: job.sourceUrl || null,
            isVerified: job.isVerified ?? true,
            fingerprint: job.fingerprint || '',
            postedAt: job.postedAt ? new Date(job.postedAt) : new Date(),
            expiresAt: job.expiresAt ? new Date(job.expiresAt) : new Date(Date.now() + 30 * 86400000),
            opportunityType: job.opportunityType || 'QUALIFIED_CA',
            channel: job.channel || 'EXTERNAL',
            sourceProvider: job.sourceProvider || 'DIRECT_EMPLOYER',
            externalJobId: job.externalJobId || null,
            canonicalUrl: job.canonicalUrl || null,
            applicationUrl: job.applicationUrl || null,
            attribution: job.attribution || null,
            originalPostedAt: job.originalPostedAt ? new Date(job.originalPostedAt) : null,
            firstSeenAt: job.firstSeenAt ? new Date(job.firstSeenAt) : new Date(),
            lastSeenAt: job.lastSeenAt ? new Date(job.lastSeenAt) : new Date(),
            lastVerifiedAt: job.lastVerifiedAt ? new Date(job.lastVerifiedAt) : new Date(),
            verificationStatus: job.verificationStatus || 'SOURCE_ACTIVE',
            duplicateClusterId: job.duplicateClusterId || null,
            isDuplicate: job.isDuplicate || false,
            duplicateOfJobId: job.duplicateOfJobId || null,
          },
          update: {
            lastSeenAt: job.lastSeenAt ? new Date(job.lastSeenAt) : new Date(),
            lastVerifiedAt: job.lastVerifiedAt ? new Date(job.lastVerifiedAt) : new Date(),
            verificationStatus: job.verificationStatus || 'SOURCE_ACTIVE',
            duplicateCount: job.duplicateCount || 0,
          },
        });
      } catch (dbErr: any) {
        this.logger.warn(`Failed to upsert job ${job.id} to DB: ${dbErr.message}`);
      }
    }
  }

  public saveJobsToDisk(jobs: JobDetail[]): void {
    try {
      this.ensureStorageInitialized();
      const tempPath = `${this.storageFile}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(jobs, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.storageFile);
    } catch (err: any) {
      this.logger.warn(`Failed to persist jobs to disk: ${err.message}`);
    }
  }

  public loadJobsFromDisk(): JobDetail[] {
    try {
      this.ensureStorageInitialized();
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err: any) {
      this.logger.warn(`Failed to load jobs from disk: ${err.message}`);
    }
    return [];
  }
}

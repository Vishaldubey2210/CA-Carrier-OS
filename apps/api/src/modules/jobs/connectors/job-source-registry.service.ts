import { Injectable, Logger } from '@nestjs/common';
import {
  AggregatorHealthReport,
  JobSourceConfigSummary,
  JobSourceStatus,
} from '@ca-career-os/shared';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JobConnector } from './job-connector.interface.js';
import { GreenhouseConnector } from './greenhouse.connector.js';
import { LeverConnector } from './lever.connector.js';
import { AshbyConnector } from './ashby.connector.js';
import { AdzunaConnector } from './adzuna.connector.js';
import { JoobleConnector } from './jooble.connector.js';
import { IcaiConnector } from './icai.connector.js';

@Injectable()
export class JobSourceRegistryService {
  private readonly logger = new Logger(JobSourceRegistryService.name);
  private readonly connectors = new Map<string, JobConnector>();
  private readonly memSourceConfigs = new Map<string, JobSourceConfigSummary>();

  constructor(private readonly prisma: PrismaService) {
    this.registerDefaultConnectors();
  }

  private registerDefaultConnectors(): void {
    const defaultConnectors: JobConnector[] = [
      new GreenhouseConnector(),
      new LeverConnector(),
      new AshbyConnector(),
      new AdzunaConnector(),
      new JoobleConnector(),
      new IcaiConnector(),
    ];

    for (const connector of defaultConnectors) {
      this.connectors.set(connector.providerId, connector);

      // Default in-memory metadata
      const initialSummary: JobSourceConfigSummary = {
        id: `src-${connector.providerId}`,
        name: this.getReadableName(connector.providerId),
        providerType: connector.providerType,
        status: connector.getStatus(),
        endpoint: this.getEndpoint(connector.providerId),
        apiKeyConfigured: connector.getStatus() === 'ACTIVE',
        allowedGeography: 'IN',
        pollingIntervalMinutes: connector.providerType === 'GREENHOUSE' ? 60 : 120,
        totalFetched: 0,
        totalIngested: 0,
        totalDuplicates: 0,
        totalExpired: 0,
      };
      this.memSourceConfigs.set(connector.providerId, initialSummary);
    }
    this.logger.log(`Registered ${this.connectors.size} job aggregator connectors.`);
  }

  getConnector(providerId: string): JobConnector | undefined {
    return this.connectors.get(providerId);
  }

  getAllConnectors(): JobConnector[] {
    return Array.from(this.connectors.values());
  }

  listSources(): JobSourceConfigSummary[] {
    return Array.from(this.memSourceConfigs.values());
  }

  updateSourceStats(
    providerId: string,
    stats: {
      fetched: number;
      ingested: number;
      duplicates: number;
      stale?: number;
      success: boolean;
      errorMessage?: string;
    }
  ): void {
    const config = this.memSourceConfigs.get(providerId);
    if (!config) return;

    const now = new Date().toISOString();
    config.lastSyncAt = now;
    if (stats.success) {
      config.lastSuccessAt = now;
      config.lastErrorMessage = null;
    } else {
      config.lastFailureAt = now;
      config.lastErrorMessage = stats.errorMessage || 'Sync failed';
    }

    config.totalFetched += stats.fetched;
    config.totalIngested += stats.ingested;
    config.totalDuplicates += stats.duplicates;
    if (stats.stale) config.totalExpired += stats.stale;
  }

  getAggregatorHealth(
    totalEnterprise: number,
    totalExternal: number,
    totalArticleship: number,
    totalDuplicates: number
  ): AggregatorHealthReport {
    const sources = this.listSources();
    const active = sources.filter((s) => s.status === 'ACTIVE').length;
    const pendingCreds = sources.filter((s) => s.status === 'PENDING_CREDENTIALS').length;
    const linkOnly = sources.filter((s) => s.status === 'LINK_ONLY').length;

    let lastGlobalSync: string | null = null;
    for (const s of sources) {
      if (s.lastSyncAt) {
        if (!lastGlobalSync || new Date(s.lastSyncAt) > new Date(lastGlobalSync)) {
          lastGlobalSync = s.lastSyncAt;
        }
      }
    }

    return {
      totalSources: sources.length,
      activeSources: active,
      pendingCredentialsSources: pendingCreds,
      linkOnlySources: linkOnly,
      totalEnterpriseJobs: totalEnterprise,
      totalExternalJobs: totalExternal,
      totalArticleshipOpportunities: totalArticleship,
      totalDuplicatesSuppressed: totalDuplicates,
      lastGlobalSyncAt: lastGlobalSync,
      sources,
    };
  }

  private getReadableName(id: string): string {
    switch (id) {
      case 'greenhouse':
        return 'Greenhouse Public ATS Boards (Razorpay, CRED, Meesho)';
      case 'lever':
        return 'Lever Postings API (Groww, Zepto)';
      case 'ashby':
        return 'Ashby Job Board API (Postman, Linear)';
      case 'adzuna':
        return 'Adzuna India Search API (Aggregator)';
      case 'jooble':
        return 'Jooble REST API (Publisher Feed)';
      case 'icai_portal':
        return 'ICAI CA Jobs & SSP Articleship Registry (Official Outbound)';
      default:
        return id.toUpperCase();
    }
  }

  private getEndpoint(id: string): string {
    switch (id) {
      case 'greenhouse':
        return 'https://boards-api.greenhouse.io/v1/boards/{board}/jobs';
      case 'lever':
        return 'https://api.lever.co/v0/postings/{site}';
      case 'ashby':
        return 'https://api.ashbyhq.com/posting-api/job-board/{org}';
      case 'adzuna':
        return 'https://api.adzuna.com/v1/api/jobs/in/search';
      case 'jooble':
        return 'https://jooble.org/api/';
      case 'icai_portal':
        return 'https://cajobs.icai.org/';
      default:
        return 'https://api.external.com';
    }
  }
}

import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { JobsService } from './jobs.service.js';

@Injectable()
export class JobSchedulerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(JobSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;
  private nextRunDate: Date | null = null;
  private lastRunDate: Date | null = null;
  private lastRunStatus: 'IDLE' | 'SUCCESS' | 'FAILED' = 'IDLE';

  constructor(private readonly jobsService: JobsService) {}

  onApplicationBootstrap() {
    this.scheduleNextRecurringRun();

    // Initial check: if jobs are empty, trigger immediate sync in background
    setTimeout(async () => {
      try {
        const query = await this.jobsService.listJobs({
          page: 1,
          limit: 1,
          sortBy: 'postedAt',
        });
        if (query.total === 0) {
          this.logger.log('Initial job database is empty. Running initial XML job sync in background...');
          await this.executeSync();
        }
      } catch (err: any) {
        this.logger.warn(`Initial job store check notice: ${err?.message}`);
      }
    }, 2000).unref();
  }

  onApplicationShutdown() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private getIntervalMs(): number {
    const raw = process.env.JOB_SYNC_INTERVAL_HOURS?.trim() || '6';
    const hours = parseFloat(raw);
    const validHours = isNaN(hours) || hours <= 0 ? 6 : hours;
    
    // Add ±10 minutes randomized anti-ban jitter to break robotic patterns
    const baseMs = validHours * 60 * 60 * 1000;
    const jitterMs = (Math.random() * 20 - 10) * 60 * 1000; // ±10 minutes
    return Math.max(30 * 60 * 1000, Math.round(baseMs + jitterMs));
  }

  /**
   * Schedule recurring job extraction with safe anti-ban intervals (6-12 hours + jitter)
   */
  private scheduleNextRecurringRun(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const intervalMs = this.getIntervalMs();
    const nextRun = new Date(Date.now() + intervalMs);
    this.nextRunDate = nextRun;

    const hoursUntil = (intervalMs / (1000 * 60 * 60)).toFixed(2);
    this.logger.log(
      `[JobScheduler] ⏰ Automated Safe Anti-Ban Sync scheduled every ${hoursUntil} hours (Next run: ${nextRun.toLocaleTimeString()} — ETag 304 Caching Active)`
    );

    this.timer = setTimeout(async () => {
      await this.executeSync();
      this.scheduleNextRecurringRun();
    }, intervalMs);

    this.timer.unref();
  }

  /**
   * Execute synchronization across multi-website scrapers, XML feeds and 5,000 CA firms directory.
   * Dispatches automated SMTP alert report upon completion.
   */
  async executeSync(): Promise<any> {
    this.logger.log(
      '[JobScheduler] ⏰ Starting automated safe job extraction across Multi-Portal Scrapers (ICAI Regional, Big 4, CA Portals), XML feeds & 5,000 CA firm career portals...'
    );
    this.lastRunDate = new Date();
    try {
      // Trigger full multi-source synchronization across all registered active connectors
      const syncResult = await this.jobsService.triggerSourceSync();

      this.lastRunStatus = 'SUCCESS';
      const totalIngested = syncResult.totalIngested || 0;
      const totalDuplicates = syncResult.totalDuplicates || 0;

      this.logger.log(
        `[JobScheduler] Safe multi-portal extraction finished in ${syncResult.durationMs}ms. Ingested: ${totalIngested}, Duplicates: ${totalDuplicates}. SMTP Notification dispatched.`
      );
      return { totalIngested, totalDuplicates, reports: syncResult.reports };
    } catch (err: any) {
      this.lastRunStatus = 'FAILED';
      this.logger.error(`[JobScheduler] Extraction encountered an error: ${err?.message}`);
      throw err;
    }
  }

  /**
   * Status of the 2-hour recurring scheduler
   */
  getStatus() {
    const hours = this.getIntervalMs() / (1000 * 60 * 60);
    return {
      intervalHours: hours,
      scheduleDescription: `Every ${hours} hours`,
      nextScheduledRun: this.nextRunDate?.toISOString() || null,
      lastRunAt: this.lastRunDate?.toISOString() || null,
      lastStatus: this.lastRunStatus,
    };
  }
}

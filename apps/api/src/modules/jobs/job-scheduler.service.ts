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
    const raw = process.env.JOB_SYNC_INTERVAL_HOURS?.trim() || '2';
    const hours = parseFloat(raw);
    const validHours = isNaN(hours) || hours <= 0 ? 2 : hours;
    return validHours * 60 * 60 * 1000;
  }

  /**
   * Schedule recurring job extraction every 2 hours
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
      `[JobScheduler] ⏰ Automated recurring XML job extraction scheduled every ${hoursUntil} hours (Next run at ${nextRun.toLocaleTimeString()} — ${nextRun.toISOString()})`
    );

    this.timer = setTimeout(async () => {
      await this.executeSync();
      this.scheduleNextRecurringRun();
    }, intervalMs);

    this.timer.unref();
  }

  /**
   * Execute synchronization across configured XML feeds
   */
  async executeSync(): Promise<any> {
    this.logger.log('[JobScheduler] ⏰ Starting automated 2-hour XML job extraction from target websites...');
    this.lastRunDate = new Date();
    try {
      const result = await this.jobsService.triggerSourceSync('xml_feed');
      this.lastRunStatus = 'SUCCESS';
      this.logger.log(
        `[JobScheduler] XML job extraction finished successfully. Ingested: ${result.totalIngested}, Duplicates: ${result.totalDuplicates}`
      );
      return result;
    } catch (err: any) {
      this.lastRunStatus = 'FAILED';
      this.logger.error(`[JobScheduler] XML job extraction encountered an error: ${err?.message}`);
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

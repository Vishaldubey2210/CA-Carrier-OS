import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';
import { JobAlertsService } from './job-alerts.service.js';
import { CareerModule } from '../career/career.module.js';
import { JobSourceRegistryService } from './connectors/job-source-registry.service.js';
import { JobDeduplicationService } from './job-deduplication.service.js';
import { JobFreshnessService } from './job-freshness.service.js';
import { JobIngestionOrchestratorService } from './job-ingestion-orchestrator.service.js';

@Module({
  imports: [CareerModule],
  controllers: [JobsController],
  providers: [
    JobSourceRegistryService,
    JobDeduplicationService,
    JobFreshnessService,
    JobIngestionOrchestratorService,
    JobsService,
    JobAlertsService,
  ],
  exports: [
    JobSourceRegistryService,
    JobDeduplicationService,
    JobFreshnessService,
    JobIngestionOrchestratorService,
    JobsService,
    JobAlertsService,
  ],
})
export class JobsModule {}

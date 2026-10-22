import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';
import { JobAlertsService } from './job-alerts.service.js';
import { CareerModule } from '../career/career.module.js';

@Module({
  imports: [CareerModule],
  controllers: [JobsController],
  providers: [JobsService, JobAlertsService],
  exports: [JobsService, JobAlertsService],
})
export class JobsModule {}

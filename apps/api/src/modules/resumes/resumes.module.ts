import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller.js';
import { ResumesService } from './resumes.service.js';
import { DocumentIntelligenceService } from './document-intelligence.service.js';
import { CareerModule } from '../career/career.module.js';
import { JobsModule } from '../jobs/jobs.module.js';

@Module({
  imports: [CareerModule, JobsModule],
  controllers: [ResumesController],
  providers: [ResumesService, DocumentIntelligenceService],
  exports: [ResumesService, DocumentIntelligenceService],
})
export class ResumesModule {}

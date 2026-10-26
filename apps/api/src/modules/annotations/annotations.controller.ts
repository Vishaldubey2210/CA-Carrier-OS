import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AnnotationsService } from './annotations.service.js';
import {
  AnnotationTaskType,
  AnnotationReviewStatus,
  CandidateJobFitData,
  FraudVerificationData,
  JobDuplicatePairData,
  InterviewAnswerRubricData,
  ResumeFieldExtractionData,
  RagQueryRelevanceData,
  RagAnswerGroundingData,
} from './annotations.types.js';

@Controller('api/v1/annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post('candidate-job-fit')
  async recordCandidateJobFit(
    @Body() body: { data: CandidateJobFitData; annotatorId?: string; annotatorName?: string }
  ) {
    if (!body.data) throw new BadRequestException('Request body must contain "data" object.');
    const annotatorId = body.annotatorId || 'expert-ca-reviewer-01';
    const annotatorName = body.annotatorName || 'Senior CA Recruiter';
    const record = await this.annotationsService.recordCandidateJobFit(body.data, annotatorId, annotatorName);
    return { success: true, record };
  }

  @Post('fraud-verification')
  async recordFraudVerification(
    @Body() body: { data: FraudVerificationData; annotatorId?: string; annotatorName?: string }
  ) {
    if (!body.data) throw new BadRequestException('Request body must contain "data" object.');
    const annotatorId = body.annotatorId || 'safety-auditor-01';
    const annotatorName = body.annotatorName || 'Fraud & Safety Specialist';
    const record = await this.annotationsService.recordFraudVerification(body.data, annotatorId, annotatorName);
    return { success: true, record };
  }

  @Post('job-duplicate')
  async recordJobDuplicate(
    @Body() body: { data: JobDuplicatePairData; annotatorId?: string; annotatorName?: string }
  ) {
    if (!body.data) throw new BadRequestException('Request body must contain "data" object.');
    const annotatorId = body.annotatorId || 'catalog-steward-01';
    const annotatorName = body.annotatorName || 'Job Catalog Data Steward';
    const record = await this.annotationsService.recordJobDuplicatePair(body.data, annotatorId, annotatorName);
    return { success: true, record };
  }

  @Post('interview-rubric')
  async recordInterviewRubric(
    @Body() body: { data: InterviewAnswerRubricData; annotatorId?: string; annotatorName?: string }
  ) {
    if (!body.data) throw new BadRequestException('Request body must contain "data" object.');
    const annotatorId = body.annotatorId || 'ca-partner-assessor-01';
    const annotatorName = body.annotatorName || 'CA Partner Interview Assessor';
    const record = await this.annotationsService.recordInterviewRubric(body.data, annotatorId, annotatorName);
    return { success: true, record };
  }

  @Post('resume-field')
  async recordResumeField(
    @Body() body: { data: ResumeFieldExtractionData; annotatorId?: string; annotatorName?: string }
  ) {
    if (!body.data) throw new BadRequestException('Request body must contain "data" object.');
    const annotatorId = body.annotatorId || 'ocr-qa-analyst-01';
    const annotatorName = body.annotatorName || 'Document Intelligence Reviewer';
    const record = await this.annotationsService.recordResumeField(body.data, annotatorId, annotatorName);
    return { success: true, record };
  }

  @Post('rag-relevance')
  async recordRagRelevance(
    @Body() body: { data: RagQueryRelevanceData; annotatorId?: string; annotatorName?: string }
  ) {
    if (!body.data) throw new BadRequestException('Request body must contain "data" object.');
    const annotatorId = body.annotatorId || 'regulatory-legal-expert-01';
    const annotatorName = body.annotatorName || 'ICAI Regulatory Compliance Specialist';
    const record = await this.annotationsService.recordRagRelevance(body.data, annotatorId, annotatorName);
    return { success: true, record };
  }

  @Post('rag-grounding')
  async recordRagGrounding(
    @Body() body: { data: RagAnswerGroundingData; annotatorId?: string; annotatorName?: string }
  ) {
    if (!body.data) throw new BadRequestException('Request body must contain "data" object.');
    const annotatorId = body.annotatorId || 'rag-safety-evaluator-01';
    const annotatorName = body.annotatorName || 'GenAI Hallucination Evaluator';
    const record = await this.annotationsService.recordRagGrounding(body.data, annotatorId, annotatorName);
    return { success: true, record };
  }

  @Get('stats')
  getStats() {
    return this.annotationsService.getStats();
  }

  @Get('export/:taskType')
  exportDataset(
    @Param('taskType') taskType: AnnotationTaskType,
    @Query('format') format: 'json' | 'jsonl' | 'csv' = 'json',
    @Res() res: Response
  ) {
    const validTaskTypes = Object.values(AnnotationTaskType);
    if (!validTaskTypes.includes(taskType)) {
      throw new BadRequestException(`Invalid taskType. Supported: ${validTaskTypes.join(', ')}`);
    }

    const payload = this.annotationsService.exportDataset(taskType, format);
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
    } else if (format === 'jsonl') {
      res.setHeader('Content-Type', 'application/x-ndjson');
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    }
    return res.status(HttpStatus.OK).send(payload);
  }

  @Get(':id')
  getAnnotation(@Param('id') id: string) {
    const record = this.annotationsService.getAnnotation(id);
    return { success: true, record };
  }

  @Get()
  listAnnotations(
    @Query('taskType') taskType?: AnnotationTaskType,
    @Query('reviewStatus') reviewStatus?: AnnotationReviewStatus
  ) {
    const items = this.annotationsService.listAnnotations(taskType, reviewStatus);
    return { success: true, count: items.length, items };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { newStatus: AnnotationReviewStatus; reviewerId?: string; notes?: string }
  ) {
    if (!body.newStatus) {
      throw new BadRequestException('newStatus is required.');
    }
    const reviewerId = body.reviewerId || 'lead-auditor-admin';
    const updated = await this.annotationsService.transitionStatus(id, body.newStatus, reviewerId, body.notes);
    return { success: true, record: updated };
  }
}

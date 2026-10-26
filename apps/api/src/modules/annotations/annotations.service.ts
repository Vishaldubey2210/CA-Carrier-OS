import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AnnotationTaskType,
  AnnotationReviewStatus,
  AnnotationRecord,
  AnnotationStats,
  CandidateJobFitData,
  FraudVerificationData,
  JobDuplicatePairData,
  InterviewAnswerRubricData,
  ResumeFieldExtractionData,
  RagQueryRelevanceData,
  RagAnswerGroundingData,
} from './annotations.types.js';

@Injectable()
export class AnnotationsService implements OnModuleInit {
  private readonly logger = new Logger(AnnotationsService.name);
  private storageDir: string;
  private storageFile: string;
  private readonly memoryStore = new Map<string, AnnotationRecord>();
  private readonly currentGuidelinesVersion = 'v2.0.0';

  constructor(@Optional() private readonly prisma?: PrismaService) {
    if (process.env.ANNOTATIONS_STORAGE_FILE) {
      this.storageFile = process.env.ANNOTATIONS_STORAGE_FILE;
      this.storageDir = path.dirname(this.storageFile);
    } else {
      this.storageDir = path.resolve(process.cwd(), 'data', 'annotations');
      this.storageFile = path.join(this.storageDir, 'annotations_store.json');
    }
  }

  setStorageFile(filePath: string): void {
    this.storageFile = filePath;
    this.storageDir = path.dirname(filePath);
    this.ensureStorageInitialized();
    this.loadFromStorage();
  }

  async onModuleInit(): Promise<void> {
    if (this.prisma && this.prisma.isDatabaseConnected()) {
      await this.loadFromDatabase();
    } else {
      this.ensureStorageInitialized();
      this.loadFromStorage();
    }
  }

  /**
   * Reset store for unit testing
   */
  clearForTesting(): void {
    this.memoryStore.clear();
    try {
      if (fs.existsSync(this.storageFile)) {
        fs.writeFileSync(this.storageFile, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch {
      // Ignored in test cleanup or read-only filesystem
    }
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      if (!this.prisma) return;
      const records = await this.prisma.annotation.findMany({
        orderBy: { createdAt: 'desc' },
      });
      this.memoryStore.clear();
      for (const r of records) {
        this.memoryStore.set(r.id, {
          id: r.id,
          taskType: r.taskType as AnnotationTaskType,
          reviewStatus: r.reviewStatus as AnnotationReviewStatus,
          annotatorId: r.annotatorId,
          annotatorName: r.annotatorName,
          guidelinesVersion: r.guidelinesVersion,
          data: r.data as any,
          auditLog: (r.auditLog as any) || [],
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        });
      }
      this.logger.log(`Loaded ${this.memoryStore.size} annotations from PostgreSQL database`);
    } catch (err: any) {
      this.logger.warn(`Could not load annotations from PostgreSQL, falling back to local storage: ${err.message}`);
      this.ensureStorageInitialized();
      this.loadFromStorage();
    }
  }

  private async saveRecordToDatabase(record: AnnotationRecord): Promise<void> {
    if (!this.prisma || !this.prisma.isDatabaseConnected()) {
      return;
    }
    try {
      await this.prisma.annotation.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          taskType: record.taskType,
          reviewStatus: record.reviewStatus,
          annotatorId: record.annotatorId,
          annotatorName: record.annotatorName,
          guidelinesVersion: record.guidelinesVersion,
          data: record.data as any,
          auditLog: record.auditLog as any,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
        },
        update: {
          reviewStatus: record.reviewStatus,
          data: record.data as any,
          auditLog: record.auditLog as any,
          updatedAt: new Date(record.updatedAt),
        },
      });
    } catch (err: any) {
      this.logger.error(`Failed to persist annotation ${record.id} to PostgreSQL: ${err.message}`);
    }
  }

  private ensureStorageInitialized(): void {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
      if (!fs.existsSync(this.storageFile)) {
        fs.writeFileSync(this.storageFile, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch (err: any) {
      this.logger.warn(`Local annotation storage file not initialized (${err.code || err.message}). Using database/memory store.`);
    }
  }

  private loadFromStorage(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const items: AnnotationRecord[] = JSON.parse(raw);
        this.memoryStore.clear();
        for (const item of items) {
          this.memoryStore.set(item.id, item);
        }
        this.logger.log(`Loaded ${this.memoryStore.size} annotations into memory from ${this.storageFile}`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not read existing annotations file, starting fresh: ${err.message}`);
    }
  }

  private persistToStorage(): void {
    try {
      const items = Array.from(this.memoryStore.values());
      const tempPath = `${this.storageFile}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(items, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.storageFile);
    } catch (err: any) {
      this.logger.warn(`Failed to persist annotations locally (${err.code || err.message}). Operating in-memory / database mode.`);
    }
  }

  /**
   * Submit a new Candidate-Job Fit Annotation
   */
  async recordCandidateJobFit(
    data: CandidateJobFitData,
    annotatorId: string,
    annotatorName: string
  ): Promise<AnnotationRecord<CandidateJobFitData>> {
    if (data.fitScore < 1 || data.fitScore > 5) {
      throw new BadRequestException('fitScore must be an integer between 1 and 5 on Likert scale.');
    }
    if (!data.candidateId || !data.jobId) {
      throw new BadRequestException('Both candidateId and jobId are required.');
    }

    return this.createRecord(AnnotationTaskType.CANDIDATE_JOB_FIT, data, annotatorId, annotatorName);
  }

  /**
   * Submit a new Job Fraud Verification Annotation
   */
  async recordFraudVerification(
    data: FraudVerificationData,
    annotatorId: string,
    annotatorName: string
  ): Promise<AnnotationRecord<FraudVerificationData>> {
    if (!data.jobId || !data.companyName) {
      throw new BadRequestException('Both jobId and companyName are required.');
    }
    if (!data.evidenceSummary || data.evidenceSummary.trim().length < 10) {
      throw new BadRequestException('evidenceSummary must be at least 10 characters detailing justification.');
    }

    return this.createRecord(AnnotationTaskType.FRAUD_VERIFICATION, data, annotatorId, annotatorName);
  }

  /**
   * Submit a Job Duplicate Pair Annotation
   */
  async recordJobDuplicatePair(
    data: JobDuplicatePairData,
    annotatorId: string,
    annotatorName: string
  ): Promise<AnnotationRecord<JobDuplicatePairData>> {
    if (!data.jobIdA || !data.jobIdB) {
      throw new BadRequestException('Both jobIdA and jobIdB are required.');
    }
    if (data.confidence < 0.0 || data.confidence > 1.0) {
      throw new BadRequestException('confidence must be a float between 0.0 and 1.0.');
    }

    return this.createRecord(AnnotationTaskType.JOB_DUPLICATE_PAIR, data, annotatorId, annotatorName);
  }

  /**
   * Submit an Interview Answer Rubric Annotation
   */
  async recordInterviewRubric(
    data: InterviewAnswerRubricData,
    annotatorId: string,
    annotatorName: string
  ): Promise<AnnotationRecord<InterviewAnswerRubricData>> {
    if (data.conceptCoverageScore < 0 || data.conceptCoverageScore > 100) {
      throw new BadRequestException('conceptCoverageScore must be between 0 and 100.');
    }
    if (data.statutoryPrecisionScore < 0 || data.statutoryPrecisionScore > 100) {
      throw new BadRequestException('statutoryPrecisionScore must be between 0 and 100.');
    }

    return this.createRecord(AnnotationTaskType.INTERVIEW_ANSWER_RUBRIC, data, annotatorId, annotatorName);
  }

  /**
   * Submit a Resume Field Extraction Annotation
   */
  async recordResumeField(
    data: ResumeFieldExtractionData,
    annotatorId: string,
    annotatorName: string
  ): Promise<AnnotationRecord<ResumeFieldExtractionData>> {
    if (!data.resumeId || !data.fieldName) {
      throw new BadRequestException('Both resumeId and fieldName are required.');
    }

    return this.createRecord(AnnotationTaskType.RESUME_FIELD_EXTRACTION, data, annotatorId, annotatorName);
  }

  /**
   * Submit a RAG Query-to-Passage Relevance Annotation
   */
  async recordRagRelevance(
    data: RagQueryRelevanceData,
    annotatorId: string,
    annotatorName: string
  ): Promise<AnnotationRecord<RagQueryRelevanceData>> {
    if (![0, 1, 2, 3].includes(data.relevanceGrade)) {
      throw new BadRequestException('relevanceGrade must be one of 0, 1, 2, 3.');
    }
    if (!data.queryId || !data.docId) {
      throw new BadRequestException('Both queryId and docId are required.');
    }

    return this.createRecord(AnnotationTaskType.RAG_QUERY_RELEVANCE, data, annotatorId, annotatorName);
  }

  /**
   * Submit a RAG Answer Grounding & Citation Annotation
   */
  async recordRagGrounding(
    data: RagAnswerGroundingData,
    annotatorId: string,
    annotatorName: string
  ): Promise<AnnotationRecord<RagAnswerGroundingData>> {
    if (!data.queryId || !data.generatedAnswer) {
      throw new BadRequestException('Both queryId and generatedAnswer are required.');
    }

    return this.createRecord(AnnotationTaskType.RAG_ANSWER_GROUNDING, data, annotatorId, annotatorName);
  }

  /**
   * Transition Review Status
   */
  async transitionStatus(
    annotationId: string,
    newStatus: AnnotationReviewStatus,
    reviewerId: string,
    notes?: string
  ): Promise<AnnotationRecord> {
    const record = this.memoryStore.get(annotationId);
    if (!record) {
      throw new NotFoundException(`Annotation with ID '${annotationId}' not found.`);
    }

    const previousStatus = record.reviewStatus;
    record.reviewStatus = newStatus;
    record.updatedAt = new Date().toISOString();
    record.auditLog.push({
      action: `STATUS_TRANSITION: ${previousStatus} -> ${newStatus}`,
      actor: reviewerId,
      timestamp: record.updatedAt,
      notes: notes || undefined,
    });

    this.memoryStore.set(annotationId, record);
    if (this.prisma && this.prisma.isDatabaseConnected()) {
      await this.saveRecordToDatabase(record);
    } else {
      this.persistToStorage();
    }
    this.logger.log(`Annotation ${annotationId} transitioned from ${previousStatus} to ${newStatus} by ${reviewerId}`);
    return record;
  }

  /**
   * Retrieve single annotation
   */
  getAnnotation(id: string): AnnotationRecord {
    const record = this.memoryStore.get(id);
    if (!record) {
      throw new NotFoundException(`Annotation with ID '${id}' not found.`);
    }
    return record;
  }

  /**
   * List annotations with optional filters
   */
  listAnnotations(taskType?: AnnotationTaskType, reviewStatus?: AnnotationReviewStatus): AnnotationRecord[] {
    let items = Array.from(this.memoryStore.values());
    if (taskType) {
      items = items.filter((item) => item.taskType === taskType);
    }
    if (reviewStatus) {
      items = items.filter((item) => item.reviewStatus === reviewStatus);
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Aggregate statistics across all tasks and human review states
   */
  getStats(): AnnotationStats {
    const byTaskType: Record<AnnotationTaskType, number> = {
      [AnnotationTaskType.CANDIDATE_JOB_FIT]: 0,
      [AnnotationTaskType.FRAUD_VERIFICATION]: 0,
      [AnnotationTaskType.JOB_DUPLICATE_PAIR]: 0,
      [AnnotationTaskType.INTERVIEW_ANSWER_RUBRIC]: 0,
      [AnnotationTaskType.RESUME_FIELD_EXTRACTION]: 0,
      [AnnotationTaskType.RAG_QUERY_RELEVANCE]: 0,
      [AnnotationTaskType.RAG_ANSWER_GROUNDING]: 0,
    };

    const byReviewStatus: Record<AnnotationReviewStatus, number> = {
      [AnnotationReviewStatus.PENDING_REVIEW]: 0,
      [AnnotationReviewStatus.REVIEWED]: 0,
      [AnnotationReviewStatus.DISPUTED]: 0,
      [AnnotationReviewStatus.REJECTED]: 0,
      [AnnotationReviewStatus.NEEDS_MORE_EVIDENCE]: 0,
    };

    for (const record of this.memoryStore.values()) {
      if (byTaskType[record.taskType] !== undefined) {
        byTaskType[record.taskType]++;
      }
      if (byReviewStatus[record.reviewStatus] !== undefined) {
        byReviewStatus[record.reviewStatus]++;
      }
    }

    return {
      totalAnnotations: this.memoryStore.size,
      byTaskType,
      byReviewStatus,
      humanReviewCounts: {
        pendingReview: byReviewStatus[AnnotationReviewStatus.PENDING_REVIEW],
        reviewed: byReviewStatus[AnnotationReviewStatus.REVIEWED],
        disputed: byReviewStatus[AnnotationReviewStatus.DISPUTED],
        rejected: byReviewStatus[AnnotationReviewStatus.REJECTED],
        needsMoreEvidence: byReviewStatus[AnnotationReviewStatus.NEEDS_MORE_EVIDENCE],
      },
    };
  }

  /**
   * Export dataset in JSON, JSONL, or CSV format
   */
  exportDataset(taskType: AnnotationTaskType, format: 'json' | 'jsonl' | 'csv' = 'json'): string {
    const records = this.listAnnotations(taskType);

    if (format === 'json') {
      return JSON.stringify(records, null, 2);
    }

    if (format === 'jsonl') {
      return records.map((r) => JSON.stringify(r)).join('\n');
    }

    if (format === 'csv') {
      if (records.length === 0) return 'id,taskType,reviewStatus,createdAt\n';
      const headers = ['id', 'taskType', 'reviewStatus', 'annotatorId', 'createdAt', 'data_summary'];
      const rows = records.map((r) => [
        r.id,
        r.taskType,
        r.reviewStatus,
        r.annotatorId,
        r.createdAt,
        `"${JSON.stringify(r.data).replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }

    throw new BadRequestException(`Unsupported export format: ${format}`);
  }

  private async createRecord<T>(
    taskType: AnnotationTaskType,
    data: T,
    annotatorId: string,
    annotatorName: string
  ): Promise<AnnotationRecord<T>> {
    const now = new Date().toISOString();
    const id = `annot-${taskType.toLowerCase().replace(/_/g, '-')}-${randomUUID().slice(0, 8)}`;

    const record: AnnotationRecord<T> = {
      id,
      taskType,
      reviewStatus: AnnotationReviewStatus.PENDING_REVIEW,
      annotatorId,
      annotatorName,
      guidelinesVersion: this.currentGuidelinesVersion,
      data,
      auditLog: [
        {
          action: 'CREATED',
          actor: annotatorId,
          timestamp: now,
          notes: `Created under guidelines ${this.currentGuidelinesVersion}`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.memoryStore.set(id, record);
    if (this.prisma && this.prisma.isDatabaseConnected()) {
      await this.saveRecordToDatabase(record);
    } else {
      this.persistToStorage();
    }
    this.logger.log(`Recorded new annotation [${taskType}] ${id} by ${annotatorName}`);
    return record;
  }
}

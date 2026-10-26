import test from 'node:test';
import assert from 'node:assert/strict';
import { AnnotationsService } from '../dist/modules/annotations/annotations.service.js';
import {
  AnnotationTaskType,
  AnnotationReviewStatus,
} from '../dist/modules/annotations/annotations.types.js';

test('AI/ML Annotation Infrastructure & Review State Lifecycle', async (t) => {
  const service = new AnnotationsService();
  service.onModuleInit();
  service.clearForTesting();

  let candFitId = '';
  let fraudId = '';
  let dedupId = '';
  let interviewId = '';
  let resumeId = '';
  let ragRelId = '';
  let ragGroundId = '';

  await t.test('1. Candidate-Job Fit Annotation: Validates Likert bounds and records item', async () => {
    // Valid submission
    const record = await service.recordCandidateJobFit(
      {
        candidateId: 'cand-ca-first-attempt-01',
        jobId: 'job-deloitte-statutory-audit-101',
        fitScore: 5,
        eligibilityConfirmed: true,
        missingRequirements: [],
        rationaleTags: ['PERFECT_ARTICLESHIP_FIT', 'EXCELLENT_TECHNICAL_COMPETENCE'],
        reviewerRole: 'PARTNER',
        notes: 'Candidate completed Big 4 articleship and passed in first attempt.',
      },
      'reviewer-partner-01',
      'CA Partner Vikram Mehta'
    );

    assert.ok(record.id.startsWith('annot-candidate-job-fit-'));
    assert.equal(record.reviewStatus, AnnotationReviewStatus.PENDING_REVIEW);
    assert.equal(record.data.fitScore, 5);
    assert.equal(record.auditLog.length, 1);
    candFitId = record.id;

    // Out of bounds check (< 1 or > 5)
    await assert.rejects(
      service.recordCandidateJobFit(
        {
          candidateId: 'c1',
          jobId: 'j1',
          fitScore: 6, // Invalid
          eligibilityConfirmed: true,
          missingRequirements: [],
          rationaleTags: [],
          reviewerRole: 'HR_MANAGER',
        },
        'u1',
        'User 1'
      ),
      /fitScore must be an integer between 1 and 5/
    );
  });

  await t.test('2. Fraud Verification Annotation: Records evidence URLs and verdict', async () => {
    const record = await service.recordFraudVerification(
      {
        jobId: 'job-fake-entry-op-99',
        companyName: 'Global Quick Hires Ltd',
        verdict: 'CONFIRMED_SCAM',
        scamType: 'ADVANCE_FEE',
        evidenceUrls: ['https://cybercrime.gov.in/complaints/12345'],
        evidenceSummary: 'Demands Rs 2,500 training deposit via Google Pay before interview.',
        reviewerNotes: 'Verified scam pattern matching Telegram job scam family.',
      },
      'safety-officer-01',
      'Priya Sharma (Fraud Auditor)'
    );

    assert.ok(record.id.startsWith('annot-fraud-verification-'));
    assert.equal(record.data.verdict, 'CONFIRMED_SCAM');
    assert.equal(record.data.scamType, 'ADVANCE_FEE');
    fraudId = record.id;
  });

  await t.test('3. Job Duplicate Pair Annotation: Validates confidence score and records pair', async () => {
    const record = await service.recordJobDuplicatePair(
      {
        jobIdA: 'job-pwc-tax-associate-01',
        jobIdB: 'job-pwc-tax-associate-repost-02',
        pairType: 'NEAR_DUPLICATE_REPOST',
        isDuplicate: true,
        confidence: 0.95,
        differencesNoted: ['Slightly different deadline date', 'Identical responsibilities'],
      },
      'catalog-steward-01',
      'Amit Kumar'
    );

    assert.ok(record.id.startsWith('annot-job-duplicate-pair-'));
    assert.equal(record.data.isDuplicate, true);
    assert.equal(record.data.confidence, 0.95);
    dedupId = record.id;

    // Invalid confidence
    await assert.rejects(
      service.recordJobDuplicatePair(
        {
          jobIdA: 'a',
          jobIdB: 'b',
          pairType: 'EXACT_COPY',
          isDuplicate: true,
          confidence: 1.5, // Invalid
          differencesNoted: [],
        },
        'u1',
        'User'
      ),
      /confidence must be a float between 0.0 and 1.0/
    );
  });

  await t.test('4. Interview Answer Rubric Annotation: Scores technical concept and statutory precision', async () => {
    const record = await service.recordInterviewRubric(
      {
        questionId: 'q-sa240-management-override',
        candidateAnswer: 'Auditor tests journal entries and reviews accounting estimates for bias.',
        conceptCoverageScore: 90,
        statutoryPrecisionScore: 85,
        hallucinationDetected: false,
        feedbackComments: 'Accurate reference to mandatory SA 240 procedures.',
      },
      'interviewer-01',
      'Senior Manager Audit'
    );

    assert.ok(record.id.startsWith('annot-interview-answer-rubric-'));
    assert.equal(record.data.conceptCoverageScore, 90);
    assert.equal(record.data.hallucinationDetected, false);
    interviewId = record.id;
  });

  await t.test('5. Resume Field Extraction Annotation: Records OCR/Extraction accuracy', async () => {
    const record = await service.recordResumeField(
      {
        resumeId: 'res-ca-final-2024-001',
        fieldName: 'articleship_firm',
        extractedValue: 'KPMG India',
        groundTruthValue: 'KPMG India',
        status: 'CORRECT',
        discrepancyNote: 'Matched Form 108 records exactly.',
      },
      'doc-qa-01',
      'Document QA Specialist'
    );

    assert.ok(record.id.startsWith('annot-resume-field-extraction-'));
    assert.equal(record.data.status, 'CORRECT');
    resumeId = record.id;
  });

  await t.test('6. RAG Query Relevance & Answer Grounding: Evaluates retrieval and hallucinations', async () => {
    const relRecord = await service.recordRagRelevance(
      {
        queryId: 'q-01-audit-rotation',
        docId: 'doc-coact-139',
        passageId: 'sec-139-2',
        relevanceGrade: 3,
        citationMatches: true,
        rationale: 'Direct statutory provision for 5-year cooling off period.',
      },
      'legal-expert-01',
      'Corporate Law Advocate'
    );

    assert.equal(relRecord.data.relevanceGrade, 3);
    ragRelId = relRecord.id;

    const groundRecord = await service.recordRagGrounding(
      {
        queryId: 'q-01-audit-rotation',
        generatedAnswer: 'Under Section 139(2), audit firms must rotate after two terms of 5 years.',
        citationValid: true,
        unsupportedClaims: [],
        hallucinationRating: 'GROUNDED',
        expertCorrection: undefined,
      },
      'ai-eval-01',
      'AI Safety Auditor'
    );

    assert.equal(groundRecord.data.hallucinationRating, 'GROUNDED');
    ragGroundId = groundRecord.id;
  });

  await t.test('7. Review State Lifecycle Transitions: PENDING_REVIEW -> REVIEWED -> DISPUTED', async () => {
    // Approve candidate fit
    const approved = await service.transitionStatus(
      candFitId,
      AnnotationReviewStatus.REVIEWED,
      'lead-recruiter-admin',
      'Verified with ICAI membership registry'
    );
    assert.equal(approved.reviewStatus, AnnotationReviewStatus.REVIEWED);
    assert.equal(approved.auditLog.length, 2);

    // Dispute fraud verification if more proof needed
    const disputed = await service.transitionStatus(
      fraudId,
      AnnotationReviewStatus.DISPUTED,
      'legal-counsel',
      'Employer submitted certificate of incorporation, requiring field investigation'
    );
    assert.equal(disputed.reviewStatus, AnnotationReviewStatus.DISPUTED);
    assert.equal(disputed.auditLog.length, 2);

    // Request more evidence on duplicate pair
    const needsMoreEv = await service.transitionStatus(
      dedupId,
      AnnotationReviewStatus.NEEDS_MORE_EVIDENCE,
      'steward-lead',
      'Check branch office location code before merging'
    );
    assert.equal(needsMoreEv.reviewStatus, AnnotationReviewStatus.NEEDS_MORE_EVIDENCE);
  });

  await t.test('8. Stats Aggregation: Reports true counts across tasks and human review states', async () => {
    const stats = service.getStats();
    assert.equal(stats.totalAnnotations, 7);
    assert.equal(stats.humanReviewCounts.reviewed, 1);
    assert.equal(stats.humanReviewCounts.disputed, 1);
    assert.equal(stats.humanReviewCounts.needsMoreEvidence, 1);
    assert.equal(stats.humanReviewCounts.pendingReview, 4);
    assert.equal(stats.humanReviewCounts.rejected, 0);

    assert.equal(stats.byTaskType[AnnotationTaskType.CANDIDATE_JOB_FIT], 1);
    assert.equal(stats.byTaskType[AnnotationTaskType.FRAUD_VERIFICATION], 1);
    assert.equal(stats.byTaskType[AnnotationTaskType.JOB_DUPLICATE_PAIR], 1);
    assert.equal(stats.byTaskType[AnnotationTaskType.INTERVIEW_ANSWER_RUBRIC], 1);
    assert.equal(stats.byTaskType[AnnotationTaskType.RESUME_FIELD_EXTRACTION], 1);
    assert.equal(stats.byTaskType[AnnotationTaskType.RAG_QUERY_RELEVANCE], 1);
    assert.equal(stats.byTaskType[AnnotationTaskType.RAG_ANSWER_GROUNDING], 1);
  });

  await t.test('9. Export Functionality: Exports training datasets in JSON, JSONL, and CSV', async () => {
    const jsonExport = service.exportDataset(AnnotationTaskType.CANDIDATE_JOB_FIT, 'json');
    const parsed = JSON.parse(jsonExport);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].id, candFitId);

    const jsonlExport = service.exportDataset(AnnotationTaskType.CANDIDATE_JOB_FIT, 'jsonl');
    const lines = jsonlExport.trim().split('\n');
    assert.equal(lines.length, 1);
    assert.equal(JSON.parse(lines[0]).id, candFitId);

    const csvExport = service.exportDataset(AnnotationTaskType.CANDIDATE_JOB_FIT, 'csv');
    assert.ok(csvExport.includes('id,taskType,reviewStatus'));
    assert.ok(csvExport.includes(candFitId));
  });

  await t.test('10. Database Persistence & Serverless Resilience: Persists via Prisma without file write reliance', async () => {
    const dbUpsertCalls = [];
    const mockPrisma = {
      isDatabaseConnected: () => true,
      annotation: {
        upsert: async (args) => {
          dbUpsertCalls.push(args);
          return args.create;
        },
        findMany: async () => [],
      },
    };

    const dbService = new AnnotationsService(mockPrisma);
    await dbService.onModuleInit();

    const record = await dbService.recordFraudVerification(
      {
        jobId: 'job-verified-db-001',
        companyName: 'Apex Advisory Services Ltd',
        verdict: 'LEGITIMATE_EMPLOYER',
        evidenceUrls: ['https://mca.gov.in/cin/12345'],
        evidenceSummary: 'MCA portal verifies CIN and active corporate filing status.',
        reviewerNotes: 'Verified against MCA master data.',
      },
      'auditor-db-01',
      'Senior Auditor Sarah'
    );

    assert.equal(dbUpsertCalls.length, 1);
    assert.equal(dbUpsertCalls[0].where.id, record.id);
    assert.equal(dbUpsertCalls[0].create.taskType, AnnotationTaskType.FRAUD_VERIFICATION);
    assert.equal(dbUpsertCalls[0].create.annotatorName, 'Senior Auditor Sarah');

    // Status transition also writes to DB
    await dbService.transitionStatus(record.id, AnnotationReviewStatus.REVIEWED, 'lead-partner');
    assert.equal(dbUpsertCalls.length, 2);
    assert.equal(dbUpsertCalls[1].update.reviewStatus, AnnotationReviewStatus.REVIEWED);
  });
});


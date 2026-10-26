export enum AnnotationTaskType {
  CANDIDATE_JOB_FIT = 'CANDIDATE_JOB_FIT',
  FRAUD_VERIFICATION = 'FRAUD_VERIFICATION',
  JOB_DUPLICATE_PAIR = 'JOB_DUPLICATE_PAIR',
  INTERVIEW_ANSWER_RUBRIC = 'INTERVIEW_ANSWER_RUBRIC',
  RESUME_FIELD_EXTRACTION = 'RESUME_FIELD_EXTRACTION',
  RAG_QUERY_RELEVANCE = 'RAG_QUERY_RELEVANCE',
  RAG_ANSWER_GROUNDING = 'RAG_ANSWER_GROUNDING',
}

export enum AnnotationReviewStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  REVIEWED = 'REVIEWED',
  DISPUTED = 'DISPUTED',
  REJECTED = 'REJECTED',
  NEEDS_MORE_EVIDENCE = 'NEEDS_MORE_EVIDENCE',
}

export interface CandidateJobFitData {
  candidateId: string;
  jobId: string;
  fitScore: number; // 1 to 5 Likert scale
  eligibilityConfirmed: boolean;
  missingRequirements: string[];
  rationaleTags: string[]; // e.g. 'ARTICLESHIP_TIER_FIT', 'EXAM_ATTEMPT_GATE', 'SALARY_EXPECTATION_MISMATCH'
  reviewerRole: 'CA_RECRUITER' | 'HR_MANAGER' | 'PARTNER';
  notes?: string;
}

export interface FraudVerificationData {
  jobId: string;
  companyName: string;
  verdict: 'CONFIRMED_SCAM' | 'LEGITIMATE_EMPLOYER' | 'SUSPICIOUS_UNVERIFIED';
  scamType?: 'ADVANCE_FEE' | 'TELEGRAM_INTERVIEW' | 'SPOOFED_DOMAIN' | 'UNREALISTIC_SALARY' | 'OTHER';
  evidenceUrls: string[];
  evidenceSummary: string;
  reviewerNotes: string;
}

export interface JobDuplicatePairData {
  jobIdA: string;
  jobIdB: string;
  pairType: 'EXACT_COPY' | 'NEAR_DUPLICATE_REPOST' | 'DISTINCT_VACANCY_SAME_COMPANY' | 'DIFFERENT_ROLES';
  isDuplicate: boolean;
  confidence: number; // 0.0 to 1.0
  differencesNoted: string[];
}

export interface InterviewAnswerRubricData {
  questionId: string;
  candidateAnswer: string;
  conceptCoverageScore: number; // 0 to 100
  statutoryPrecisionScore: number; // 0 to 100
  hallucinationDetected: boolean;
  hallucinatedCitations?: string[];
  feedbackComments: string;
}

export interface ResumeFieldExtractionData {
  resumeId: string;
  fieldName: 'qualifications' | 'articleship_firm' | 'experience_years' | 'certifications' | 'domain_skills';
  extractedValue: any;
  groundTruthValue: any;
  status: 'CORRECT' | 'PARTIAL' | 'MISSING' | 'HALLUCINATED';
  discrepancyNote?: string;
}

export interface RagQueryRelevanceData {
  queryId: string;
  docId: string;
  passageId?: string;
  relevanceGrade: 0 | 1 | 2 | 3; // 0: Irrelevant, 1: Tangential, 2: Relevant, 3: Direct Authority
  citationMatches: boolean;
  rationale: string;
}

export interface RagAnswerGroundingData {
  queryId: string;
  generatedAnswer: string;
  citationValid: boolean;
  unsupportedClaims: string[];
  hallucinationRating: 'GROUNDED' | 'MINOR_HALLUCINATION' | 'CRITICAL_HALLUCINATION';
  expertCorrection?: string;
}

export interface AnnotationAuditEntry {
  action: string;
  actor: string;
  timestamp: string;
  notes?: string;
}

export interface AnnotationRecord<T = any> {
  id: string;
  taskType: AnnotationTaskType;
  reviewStatus: AnnotationReviewStatus;
  annotatorId: string;
  annotatorName: string;
  guidelinesVersion: string;
  data: T;
  auditLog: AnnotationAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationStats {
  totalAnnotations: number;
  byTaskType: Record<AnnotationTaskType, number>;
  byReviewStatus: Record<AnnotationReviewStatus, number>;
  humanReviewCounts: {
    pendingReview: number;
    reviewed: number;
    disputed: number;
    rejected: number;
    needsMoreEvidence: number;
  };
}

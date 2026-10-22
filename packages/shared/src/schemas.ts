import { z } from 'zod';
import {
  UserRole,
  WorkspaceType,
  MemberRole,
  CAPathway,
  ApplicationStatus,
  PermissionTier,
  ApiResponse,
  ApiErrorResponse,
} from './types.js';

export const EnvConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/ca_career_os?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16).default('ca-career-os-dev-jwt-secret-minimum-32-chars-long!'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  API_BASE_URL: z.string().default('http://localhost:4000'),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

export const HealthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  uptimeSeconds: z.number(),
  environment: z.string(),
  timestamp: z.string(),
  services: z.object({
    database: z.object({
      status: z.enum(['up', 'down', 'degraded']),
      latencyMs: z.number().optional(),
      message: z.string().optional(),
    }),
    redis: z.object({
      status: z.enum(['up', 'down', 'degraded']),
      latencyMs: z.number().optional(),
      message: z.string().optional(),
    }),
  }),
});

export function createSuccessResponse<T>(
  data: T,
  meta?: {
    correlationId?: string;
    page?: number;
    limit?: number;
    total?: number;
  }
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      correlationId: meta?.correlationId,
      timestamp: new Date().toISOString(),
      ...(meta?.page !== undefined && meta?.limit !== undefined && meta?.total !== undefined
        ? {
            pagination: {
              page: meta.page,
              limit: meta.limit,
              total: meta.total,
              totalPages: Math.ceil(meta.total / meta.limit),
            },
          }
        : {}),
    },
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Array<{ field: string; issue: string }>,
  correlationId?: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
      ...(correlationId ? { correlationId } : {}),
    },
  };
}

export const RegisterRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'A valid email address is required' }),
  password: z.string().min(12, { message: 'Password must be at least 12 characters long' }),
  firstName: z.string().trim().min(1, { message: 'First name is required' }),
  lastName: z.string().trim().min(1, { message: 'Last name is required' }),
  role: z.nativeEnum(UserRole).default(UserRole.CANDIDATE),
  organizationName: z.string().trim().min(2).optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'A valid email address is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'A valid email address is required' }),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  newPassword: z.string().min(12, { message: 'Password must be at least 12 characters long' }),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const CreateWorkspaceSchema = z.object({
  name: z.string().trim().min(2, { message: 'Workspace name must be at least 2 characters' }).max(100),
  type: z.nativeEnum(WorkspaceType).default(WorkspaceType.ORGANIZATION),
});
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;

export const InviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'A valid email address is required' }),
  role: z.nativeEnum(MemberRole).default(MemberRole.MEMBER),
});
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: z.nativeEnum(MemberRole),
});
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

export const CandidateSkillSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().default('General'),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  verified: z.boolean().default(false),
});

export const CandidateProfileInputSchema = z.object({
  icaiMembershipNo: z.string().trim().optional(),
  qualificationDate: z.string().optional(),
  caFinalStatus: z.enum(['QUALIFIED', 'FINALIST', 'SEMI_QUALIFIED']).default('QUALIFIED'),
  attemptsCount: z.coerce.number().min(0).max(20).optional(),
  articleshipFirm: z.string().trim().optional(),
  articleshipFirmTier: z.enum(['BIG4', 'TOP10', 'MID_SIZE', 'SMALL']).optional(),
  articleshipWeeks: z.coerce.number().min(0).max(300).default(156),
  articleshipAreas: z.array(z.string()).default([]),
  skills: z.array(CandidateSkillSchema).default([]),
  softwareProficiencies: z.array(z.string()).default([]),
  preferredPathways: z.array(z.string()).default([]),
  targetCities: z.array(z.string()).default([]),
  targetSalaryMin: z.coerce.number().min(0).optional(),
  targetSalaryMax: z.coerce.number().min(0).optional(),
  summary: z.string().max(2000).optional(),
});
export type CandidateProfileInput = z.infer<typeof CandidateProfileInputSchema>;

export const GenerateRoadmapInputSchema = z.object({
  targetPathway: z.nativeEnum(CAPathway),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

export const UpdateTaskStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
});
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;

// -------------------------------------------------------------
// Phase 3: Job Discovery & Ingestion Schemas
// -------------------------------------------------------------

export const JobFilterQuerySchema = z.object({
  query: z.string().trim().optional(),
  caPathway: z.nativeEnum(CAPathway).optional(),
  city: z.string().trim().optional(),
  workArrangement: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
  minSalary: z.coerce.number().min(0).optional(),
  minExperience: z.coerce.number().min(0).optional(),
  isVerified: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  savedOnly: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['postedAt', 'salary', 'matchScore']).default('postedAt'),
});
export type JobFilterQueryInput = z.infer<typeof JobFilterQuerySchema>;

export const CreateJobSchema = z.object({
  title: z.string().trim().min(3, { message: 'Job title must be at least 3 characters' }),
  companyName: z.string().trim().min(2, { message: 'Company name is required' }),
  locationCity: z.string().trim().min(2, { message: 'City is required' }),
  workArrangement: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).default('HYBRID'),
  caPathway: z.nativeEnum(CAPathway),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  salaryDisclosed: z.boolean().default(false),
  experienceMin: z.coerce.number().min(0).default(0),
  experienceMax: z.coerce.number().min(0).default(3),
  rawDescription: z.string().trim().min(20, { message: 'Job description must be at least 20 characters' }),
  mandatorySkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  requiredQualification: z.string().optional(),
  minArticleshipMonths: z.coerce.number().min(0).optional(),
  preferredFirmTiers: z.array(z.string()).default([]),
  keyResponsibilities: z.array(z.string()).default([]),
  source: z.string().default('DIRECT_EMPLOYER'),
  sourceUrl: z.string().url().optional().or(z.literal('')),
});
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export const JobIngestSchema = z.object({
  jobs: z.array(CreateJobSchema).min(1, { message: 'At least one job is required for ingestion' }),
});
export type JobIngestInputType = z.infer<typeof JobIngestSchema>;

export const SaveJobNoteSchema = z.object({
  notes: z.string().max(1000).optional(),
});

// -------------------------------------------------------------
// Phase 3: Application Tracking Schemas
// -------------------------------------------------------------

export const CreateApplicationSchema = z.object({
  jobId: z.string().uuid({ message: 'Valid Job UUID is required' }),
  resumeVersionId: z.string().uuid().optional(),
  status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.SAVED),
  coverNote: z.string().max(2000).optional(),
  recruiterContact: z
    .object({
      name: z.string().trim().optional(),
      email: z.string().email().optional().or(z.literal('')),
      notes: z.string().optional(),
    })
    .optional(),
  nextFollowUpDate: z.string().optional(),
});
export type CreateApplicationInputType = z.infer<typeof CreateApplicationSchema>;

export const UpdateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().max(1000).optional(),
});
export type UpdateApplicationStatusInputType = z.infer<typeof UpdateApplicationStatusSchema>;

export const CreateFollowUpTaskSchema = z.object({
  title: z.string().trim().min(2, { message: 'Title is required' }),
  dueDate: z.string().optional(),
});
export type CreateFollowUpTaskInputType = z.infer<typeof CreateFollowUpTaskSchema>;

// -------------------------------------------------------------
// Phase 3: Resume Builder & Tailoring Schemas
// -------------------------------------------------------------

export const CreateResumeSchema = z.object({
  title: z.string().trim().min(2, { message: 'Resume title must be at least 2 characters' }),
  targetPathway: z.nativeEnum(CAPathway).default(CAPathway.AUDIT),
  isDefault: z.boolean().default(false),
});
export type CreateResumeInput = z.infer<typeof CreateResumeSchema>;

export const TailorResumeSchema = z.object({
  resumeId: z.string().uuid({ message: 'Valid Resume UUID is required' }),
  jobId: z.string().uuid({ message: 'Valid Job UUID is required' }),
  emphasis: z.string().max(500).optional(),
});
export type TailorResumeInputType = z.infer<typeof TailorResumeSchema>;

export const AttestResumeSchema = z.object({
  candidateAttested: z.boolean().refine((val) => val === true, {
    message: 'Candidate must explicitly attest all claims before export',
  }),
});

export const DraftCoverLetterSchema = z.object({
  jobId: z.string().uuid({ message: 'Valid Job UUID is required' }),
  recipientName: z.string().trim().optional(),
  tone: z.enum(['FORMAL', 'EXECUTIVE', 'DIRECT']).default('FORMAL'),
});
export type DraftCoverLetterInput = z.infer<typeof DraftCoverLetterSchema>;

export const CreatePortfolioEntrySchema = z.object({
  title: z.string().trim().min(3, { message: 'Title must be at least 3 characters' }),
  category: z.string().trim().min(2, { message: 'Category is required' }),
  description: z.string().trim().min(10, { message: 'Description must be at least 10 characters' }),
  highlights: z.array(z.string()).default([]),
  linkUrl: z.string().url().optional().or(z.literal('')),
});
export type CreatePortfolioEntryInput = z.infer<typeof CreatePortfolioEntrySchema>;

// -------------------------------------------------------------
// Phase 4: Mock Interview & Answer Submission Schemas
// -------------------------------------------------------------

export const CreateInterviewSessionSchema = z.object({
  targetPathway: z.nativeEnum(CAPathway),
  targetRole: z.string().trim().min(2, { message: 'Target role is required' }),
  topic: z.string().trim().min(2, { message: 'Interview topic is required' }),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  questionCount: z.coerce.number().min(1).max(10).default(3),
});
export type CreateInterviewSessionInputType = z.infer<typeof CreateInterviewSessionSchema>;

export const SubmitAnswerSchema = z.object({
  questionId: z.string().uuid({ message: 'Valid Question UUID is required' }),
  answer: z.string().trim().min(5, { message: 'Answer must contain at least 5 characters' }),
});
export type SubmitAnswerInputType = z.infer<typeof SubmitAnswerSchema>;

// -------------------------------------------------------------
// Phase 4: AI Career Agent & Approval Decision Schemas
// -------------------------------------------------------------

export const AgentChatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1, { message: 'Message cannot be empty' }).max(4000),
});
export type AgentChatInputType = z.infer<typeof AgentChatSchema>;

export const ApprovalDecisionSchema = z.object({
  approvalId: z.string().uuid({ message: 'Valid Approval UUID is required' }),
  decision: z.enum(['APPROVED', 'DECLINED']),
  signedApprovalToken: z.string().min(16, { message: 'Signed approval token is required' }),
});
export type ApprovalDecisionInputType = z.infer<typeof ApprovalDecisionSchema>;

// -------------------------------------------------------------
// Phase 5: Professional Growth, Recruitment & Practice Management Schemas
// -------------------------------------------------------------

export const CreateOfferComparisonSchema = z.object({
  title: z.string().min(2, { message: 'Title is required' }),
  companyName: z.string().min(2, { message: 'Company name is required' }),
  roleTitle: z.string().min(2, { message: 'Role title is required' }),
  baseSalary: z.number().nonnegative(),
  variablePay: z.number().nonnegative().default(0),
  variableConditions: z.string().optional(),
  bonus: z.number().nonnegative().default(0),
  benefitsValue: z.number().nonnegative().default(0),
  stockValue: z.number().nonnegative().default(0),
  locationCity: z.string().min(2),
  workArrangement: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).default('HYBRID'),
  learningPriorityScore: z.number().int().min(1).max(5).default(3),
});
export type CreateOfferComparisonInputType = z.infer<typeof CreateOfferComparisonSchema>;

export const CreateMentorBookingSchema = z.object({
  mentorProfileId: z.string().uuid({ message: 'Valid Mentor UUID is required' }),
  slotStartTime: z.string().datetime({ message: 'Valid slotStartTime ISO string is required' }),
  slotEndTime: z.string().datetime({ message: 'Valid slotEndTime ISO string is required' }),
  sessionNotes: z.string().max(1000).optional(),
});
export type CreateMentorBookingInputType = z.infer<typeof CreateMentorBookingSchema>;

export const CreateCommunityPostSchema = z.object({
  pathway: z.nativeEnum(CAPathway),
  title: z.string().trim().min(5).max(200),
  content: z.string().trim().min(10).max(10000),
  category: z.enum(['INTERVIEW_EXPERIENCE', 'TECHNICAL_DEBATE', 'CAREER_ADVICE', 'GENERAL']).default('GENERAL'),
  isAnonymous: z.boolean().default(false),
});
export type CreateCommunityPostInputType = z.infer<typeof CreateCommunityPostSchema>;

export const CreateCommunityReplySchema = z.object({
  content: z.string().trim().min(2).max(4000),
  isAnonymous: z.boolean().default(false),
});
export type CreateCommunityReplyInputType = z.infer<typeof CreateCommunityReplySchema>;

export const CreateCommunityReportSchema = z.object({
  resourceType: z.enum(['POST', 'REPLY']),
  resourceId: z.string().uuid(),
  reason: z.enum(['SPAM', 'HARASSMENT', 'COMMERCIAL_SOLICITATION', 'CONFIDENTIALITY_BREACH', 'MISINFORMATION']),
  notes: z.string().optional(),
});
export type CreateCommunityReportInputType = z.infer<typeof CreateCommunityReportSchema>;

export const CreatePracticeClientSchema = z.object({
  clientName: z.string().trim().min(2),
  entityType: z.enum(['INDIVIDUAL', 'PROPRIETORSHIP', 'PARTNERSHIP', 'PVT_LTD', 'PUBLIC_LTD', 'TRUST']),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid Indian PAN format' }).optional().or(z.literal('')),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'Invalid GSTIN format' }).optional().or(z.literal('')),
  cin: z.string().optional(),
  contactPerson: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
});
export type CreatePracticeClientInputType = z.infer<typeof CreatePracticeClientSchema>;

export const CreatePracticeComplianceTaskSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(3),
  complianceCategory: z.enum([
    'INCOME_TAX_ITR',
    'TAX_AUDIT_44AB',
    'GST_MONTHLY',
    'GST_ANNUAL_9C',
    'TDS_RETURN',
    'ROC_ANNUAL_MGT7_AOC4',
  ]),
  statutoryDueDate: z.string().datetime(),
  internalDeadline: z.string().datetime(),
  financialYear: z.string().regex(/^20\d{2}-\d{2}$/, { message: 'Format FY YYYY-YY (e.g. 2024-25)' }),
  assessmentYear: z.string().regex(/^20\d{2}-\d{2}$/, { message: 'Format AY YYYY-YY (e.g. 2025-26)' }),
  notes: z.string().optional(),
});
export type CreatePracticeComplianceTaskInputType = z.infer<typeof CreatePracticeComplianceTaskSchema>;

export const UpdateRecruitmentPipelineStageSchema = z.object({
  pipelineStage: z.enum(['NEW', 'IN_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']),
  internalNotes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  interviewScheduledAt: z.string().datetime().optional(),
});
export type UpdateRecruitmentPipelineStageInputType = z.infer<typeof UpdateRecruitmentPipelineStageSchema>;

export const EmployerVerificationRequestSchema = z.object({
  businessRegistrationNo: z.string().min(5),
  documentsJson: z.record(z.any()).default({}),
});
export type EmployerVerificationRequestInputType = z.infer<typeof EmployerVerificationRequestSchema>;

// =========================================================================
// Phase 6: Billing & Subscription Schemas
// =========================================================================

export const InitiateCheckoutSchema = z.object({
  planTier: z.enum(['PRO_CANDIDATE', 'TEAM_EMPLOYER', 'PRACTICE_CRM']),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).default('MONTHLY'),
  b2bGstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'Invalid Indian GSTIN format' }).optional(),
});
export type InitiateCheckoutInputType = z.infer<typeof InitiateCheckoutSchema>;

export const CancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type CancelSubscriptionInputType = z.infer<typeof CancelSubscriptionSchema>;

export const RazorpayWebhookPayloadSchema = z.object({
  event: z.string(),
  payload: z.record(z.any()),
});
export type RazorpayWebhookPayloadInputType = z.infer<typeof RazorpayWebhookPayloadSchema>;

// =========================================================================
// Remediation M-006: Job Alerts & Document Intelligence Schemas
// =========================================================================

export const JobAlertPreferencesSchema = z.object({
  pathways: z.array(z.nativeEnum(CAPathway)).default([CAPathway.AUDIT]),
  minSalary: z.number().min(0).optional(),
  preferredCities: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  frequency: z.enum(['DAILY', 'WEEKLY', 'INSTANT']).default('DAILY'),
  enabled: z.boolean().default(true),
});
export type JobAlertPreferences = z.infer<typeof JobAlertPreferencesSchema>;

export const DocumentUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.enum(['application/pdf', 'image/png', 'image/jpeg']),
  documentType: z.enum(['FORM_108', 'FORM_102_103', 'CA_FINAL_MARKSHEET', 'OTHER']).default('FORM_108'),
  base64Content: z.string().min(1),
});
export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;

export const Form108ExtractionSchema = z.object({
  firmName: z.string().min(2),
  firmRegistrationNumber: z.string().min(4),
  principalName: z.string().min(2),
  principalMembershipNumber: z.string().min(4),
  articleshipStartDate: z.string(),
  articleshipEndDate: z.string(),
  totalWeeksServed: z.number().min(1),
  leaveTakenWeeks: z.number().min(0),
  areasOfPractice: z.array(z.string()).min(1),
  isOcrExtracted: z.boolean(),
  isMock: z.boolean(),
  confidence: z.number().min(0).max(1),
});
export type Form108ExtractionResult = z.infer<typeof Form108ExtractionSchema>;






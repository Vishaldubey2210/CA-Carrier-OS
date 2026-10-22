/**
 * CA Career OS — Shared Domain Types & Enums
 */

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  MENTOR = 'MENTOR',
  ORG_ADMIN = 'ORG_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
}

export enum WorkspaceType {
  PERSONAL = 'PERSONAL',
  ORGANIZATION = 'ORGANIZATION',
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  RECRUITER = 'RECRUITER',
  VIEWER = 'VIEWER',
}

export enum CAPathway {
  AUDIT = 'AUDIT',
  TAX = 'TAX',
  FPA = 'FPA',
  CORP_FIN = 'CORP_FIN',
  IB = 'IB',
  CONSULTING = 'CONSULTING',
  PRACTICE = 'PRACTICE',
}

export enum ApplicationStatus {
  SAVED = 'SAVED',
  PLANNED = 'PLANNED',
  TAILORED = 'TAILORED',
  APPLIED = 'APPLIED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWING = 'INTERVIEWING',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum PermissionTier {
  READ_ONLY = 'READ_ONLY',
  WRITE = 'WRITE',
  EXPLICITLY_APPROVED_EXTERNAL = 'EXPLICITLY_APPROVED_EXTERNAL',
  DESTRUCTIVE = 'DESTRUCTIVE',
}

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  DENIED = 'DENIED',
  CANCELLED = 'CANCELLED',
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessMeta {
  correlationId?: string;
  timestamp: string;
  pagination?: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta: ApiSuccessMeta;
}

export interface ApiFieldError {
  field: string;
  issue: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: ApiFieldError[];
  correlationId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
  };
}

export interface AuthUserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  workspaceId?: string;
  exp?: number;
  iat?: number;
  jti?: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserPayload;
  defaultWorkspaceId: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  ownerId: string;
  role: MemberRole;
  isDefault: boolean;
  createdAt: string;
}

export interface WorkspaceMemberDetail {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: MemberRole;
  joinedAt: string;
}

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface CandidateSkillItem {
  name: string;
  category: string;
  proficiency: SkillProficiency;
  verified?: boolean;
}

export interface CandidateProfileData {
  id: string;
  userId: string;
  workspaceId: string;
  icaiMembershipNo?: string | null;
  qualificationDate?: string | null;
  caFinalStatus: string;
  attemptsCount?: number | null;
  articleshipFirm?: string | null;
  articleshipFirmTier?: string | null;
  articleshipWeeks: number;
  articleshipAreas: string[];
  skills: CandidateSkillItem[];
  softwareProficiencies: string[];
  preferredPathways: string[];
  targetCities: string[];
  targetSalaryMin?: number | null;
  targetSalaryMax?: number | null;
  summary?: string | null;
  profileCompletionPct: number;
  updatedAt: string;
}

export interface PathwayFitReport {
  pathway: CAPathway;
  title: string;
  fitScore: number;
  matchCategory: 'STRONG_MATCH' | 'GOOD_MATCH' | 'POTENTIAL_MATCH' | 'PIVOT_REQUIRED';
  whyItSuits: string[];
  matchingSkills: string[];
  missingSkills: string[];
  typicalRoles: string[];
  learningActivities: string[];
}

export interface CriticalSkillGap {
  skill: string;
  pathway: CAPathway;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
  recommendedAction: string;
}

export interface SkillGapAnalysisReport {
  candidateId: string;
  pathwayFitReports: PathwayFitReport[];
  topRecommendedPathway: CAPathway;
  criticalGaps: CriticalSkillGap[];
  generatedAt: string;
}

export interface CareerRoadmapTaskItem {
  id: string;
  roadmapId: string;
  milestone: 'DAY_30' | 'DAY_60' | 'DAY_90';
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string | null;
  dueDate?: string | null;
}

export interface CareerRoadmapDetail {
  id: string;
  candidateProfileId: string;
  workspaceId: string;
  targetPathway: CAPathway;
  overallFitScore: number;
  summary: string;
  tasks: CareerRoadmapTaskItem[];
  progressPct: number;
  generatedAt: string;
}

// -------------------------------------------------------------
// Phase 3: Job Discovery & Matching Types
// -------------------------------------------------------------

export type WorkArrangement = 'REMOTE' | 'HYBRID' | 'ONSITE';

export interface StructuredJobRequirements {
  mandatorySkills: string[];
  preferredSkills: string[];
  requiredQualification?: string;
  minArticleshipMonths?: number;
  preferredFirmTiers?: string[];
  keyResponsibilities: string[];
}

export interface JobDetail {
  id: string;
  employerId: string;
  sourceId?: string | null;
  title: string;
  normalizedTitle: string;
  companyName: string;
  locationCity: string;
  workArrangement: WorkArrangement;
  caPathway: CAPathway;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryDisclosed: boolean;
  experienceMin: number;
  experienceMax: number;
  rawDescription: string;
  structuredRequirements: StructuredJobRequirements;
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  source: string;
  sourceUrl?: string | null;
  isVerified: boolean;
  fingerprint: string;
  postedAt: string;
  expiresAt: string;
  matchScore?: number;
  isSaved?: boolean;
}

export interface JobFilterQuery {
  query?: string;
  caPathway?: CAPathway;
  city?: string;
  workArrangement?: WorkArrangement;
  minSalary?: number;
  minExperience?: number;
  isVerified?: boolean;
  savedOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'postedAt' | 'salary' | 'matchScore';
}

export interface JobMatchReport {
  jobId: string;
  matchScore: number;
  fitCategory: 'STRONG_MATCH' | 'MODERATE_MATCH' | 'STRETCH_ROLE' | 'LOW_FIT';
  isEligible: boolean;
  eligibilityReasons: string[];
  matchingSkills: string[];
  missingSkills: string[];
  experienceFit: string;
  explanation: string;
  limitations: string[];
}

export interface JobIngestInput {
  companyName: string;
  title: string;
  locationCity: string;
  workArrangement?: WorkArrangement;
  caPathway: CAPathway;
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  rawDescription: string;
  mandatorySkills?: string[];
  preferredSkills?: string[];
  requiredQualification?: string;
  minArticleshipMonths?: number;
  preferredFirmTiers?: string[];
  keyResponsibilities?: string[];
  source?: string;
  sourceUrl?: string;
}

export interface IngestionResult {
  ingestedCount: number;
  duplicateCount: number;
  rejectedCount: number;
  jobs: JobDetail[];
}

// -------------------------------------------------------------
// Phase 3: Saved Jobs & Application Tracking Types
// -------------------------------------------------------------

export interface SavedJobItem {
  id: string;
  candidateProfileId: string;
  jobId: string;
  job: JobDetail;
  notes?: string | null;
  savedAt: string;
}

export interface ApplicationStatusHistoryItem {
  id: string;
  applicationId: string;
  fromStatus?: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  notes?: string | null;
  changedAt: string;
}

export interface FollowUpTaskItem {
  id: string;
  applicationId: string;
  title: string;
  dueDate?: string | null;
  completed: boolean;
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  candidateProfileId: string;
  jobId: string;
  job: JobDetail;
  resumeVersionId?: string | null;
  resumeTitle?: string | null;
  status: ApplicationStatus;
  coverNote?: string | null;
  recruiterContact?: {
    name?: string;
    email?: string;
    notes?: string;
  };
  appliedAt?: string | null;
  statusUpdatedAt: string;
  nextFollowUpDate?: string | null;
  history: ApplicationStatusHistoryItem[];
  followUps: FollowUpTaskItem[];
}

export interface CreateApplicationInput {
  jobId: string;
  resumeVersionId?: string;
  status?: ApplicationStatus;
  coverNote?: string;
  recruiterContact?: {
    name?: string;
    email?: string;
    notes?: string;
  };
  nextFollowUpDate?: string;
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus;
  notes?: string;
}

export interface CreateFollowUpInput {
  title: string;
  dueDate?: string;
}

// -------------------------------------------------------------
// Phase 3: Resume Builder & Zero-Fabrication Tailoring Types
// -------------------------------------------------------------

export interface ResumeEducationItem {
  title: string;
  institution: string;
  year: string;
  scoreOrRank?: string;
}

export interface ResumeArticleshipDetail {
  firm: string;
  firmTier: string;
  duration: string;
  domains: string[];
  highlights: string[];
}

export interface ResumeWorkExperienceItem {
  company: string;
  title: string;
  period: string;
  achievements: string[];
}

export interface ResumeSkillsSection {
  technical: string[];
  standards: string[]; // e.g., Ind AS, IFRS, CARO
  tools: string[];     // e.g., SAP, Excel, PowerBI
}

export interface ResumeProjectItem {
  title: string;
  description: string;
  impact?: string;
}

export interface ResumeSectionContent {
  summary: string;
  qualification: ResumeEducationItem[];
  articleship: ResumeArticleshipDetail;
  workExperience: ResumeWorkExperienceItem[];
  skills: ResumeSkillsSection;
  certifications: string[];
  projects: ResumeProjectItem[];
}

export interface ResumeSummary {
  id: string;
  candidateProfileId: string;
  title: string;
  targetPathway: CAPathway;
  isDefault: boolean;
  activeVersionId?: string;
  versionsCount: number;
  updatedAt: string;
}

export interface ResumeDetail {
  id: string;
  candidateProfileId: string;
  title: string;
  targetPathway: CAPathway;
  isDefault: boolean;
  versions: ResumeVersionDetail[];
  updatedAt: string;
}

export interface ClaimAttestationReport {
  verifiedProfileFactsCount: number;
  synthesizedWordingCount: number;
  unverifiedClaims: string[];
}

export interface ResumeVersionDetail {
  id: string;
  resumeId: string;
  versionNumber: number;
  title: string;
  summary?: string | null;
  targetedJobId?: string | null;
  targetedJobTitle?: string | null;
  targetedCompanyName?: string | null;
  matchScore?: number | null;
  parsedContent: ResumeSectionContent;
  claimAttestations: ClaimAttestationReport;
  candidateAttested: boolean;
  pdfUrl?: string | null;
  createdAt: string;
}

export interface TailorResumeInput {
  resumeId: string;
  jobId: string;
  emphasis?: string;
}

export interface CoverLetterDraft {
  title: string;
  content: string;
  recipient: string;
  jobTitle: string;
  companyName: string;
  verifiedPointsReferenced: string[];
  generatedAt: string;
}

export interface PortfolioItem {
  id: string;
  candidateProfileId: string;
  title: string;
  category: string;
  description: string;
  highlights: string[];
  linkUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// Phase 4: Interview Question Bank & Mock Sessions
// -------------------------------------------------------------

export type QuestionDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type InterviewSessionStatus =
  | 'CREATED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface QuestionBankItem {
  id: string;
  pathway: CAPathway;
  domain: string;
  topic: string;
  subtopic?: string;
  difficulty: QuestionDifficulty;
  question: string;
  idealAnswerKeyPoints: string[];
  scoringRubric: {
    technicalCorrectness: string;
    completeness: string;
    reasoning: string;
    practicalApplication: string;
  };
  regulatoryReference?: string;
}

export interface QuestionEvaluationDetail {
  technicalCorrectness: number; // 0-100
  completeness: number;         // 0-100
  reasoning: number;            // 0-100
  clarity: number;              // 0-100
  score: number;                // 0-100 overall
  strengths: string[];
  improvementAreas: string[];
  feedbackNotes: string;
  conceptsIdentified: string[];
}

export interface InterviewQuestionSessionItem {
  id: string;
  questionText: string;
  domain: string;
  topic: string;
  difficulty: string;
  candidateAnswer?: string | null;
  score?: number | null;
  evaluation?: QuestionEvaluationDetail | null;
  orderIndex: number;
}

export interface InterviewSessionFeedback {
  summary: string;
  strengths: string[];
  criticalWeaknesses: string[];
  recommendedPracticeTopics: string[];
  recommendedLearningTasks: string[];
}

export interface InterviewSessionDetail {
  id: string;
  candidateProfileId: string;
  workspaceId: string;
  targetPathway: CAPathway;
  targetRole: string;
  topic: string;
  difficulty: QuestionDifficulty;
  status: InterviewSessionStatus;
  questions: InterviewQuestionSessionItem[];
  overallScore?: number | null;
  feedback?: InterviewSessionFeedback | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface CreateInterviewSessionInput {
  targetPathway: CAPathway;
  targetRole: string;
  topic: string;
  difficulty?: QuestionDifficulty;
  questionCount?: number;
}

export interface SubmitAnswerInput {
  questionId: string;
  answer: string;
}

// -------------------------------------------------------------
// Phase 4: AI Career Agent & Secure Tool Execution
// -------------------------------------------------------------

export type AgentRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';

export interface AgentToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  permissionTier: PermissionTier;
}

export interface AgentToolResult {
  toolCallId: string;
  toolName: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ApprovalRequestMetadata {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  actionPreview: string;
  signedApprovalToken: string;
  expiresAt: string;
  decision: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED';
}

export interface AgentMessageItem {
  id: string;
  conversationId: string;
  role: AgentRole;
  content: string;
  toolCalls?: AgentToolCall[];
  toolResults?: AgentToolResult[];
  approvalRequest?: ApprovalRequestMetadata | null;
  createdAt: string;
}

export interface AgentConversationDetail {
  id: string;
  candidateProfileId: string;
  workspaceId: string;
  title: string;
  messages: AgentMessageItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentChatInput {
  conversationId?: string;
  message: string;
}

export interface ApprovalDecisionInput {
  approvalId: string;
  decision: 'APPROVED' | 'DECLINED';
  signedApprovalToken: string;
}

// -------------------------------------------------------------
// Phase 5: Professional Growth, Recruitment & Practice Management
// -------------------------------------------------------------

export interface SalaryBenchmarkItem {
  id: string;
  pathway: CAPathway;
  roleTitle: string;
  experienceMin: number;
  experienceMax: number;
  locationCity: string;
  industry: string;
  medianSalary: number;
  p25Salary: number;
  p75Salary: number;
  sampleSize: number;
  collectionPeriod: string;
  dataSourceProvenance: string;
  dataLimitations: string;
}

export interface OfferComparisonItem {
  id: string;
  userId: string;
  workspaceId: string;
  title: string;
  companyName: string;
  roleTitle: string;
  baseSalary: number;
  variablePay: number;
  variableConditions?: string | null;
  bonus: number;
  benefitsValue: number;
  stockValue: number;
  totalCtc: number;
  monthlyNetEstimate: number;
  locationCity: string;
  workArrangement: string;
  learningPriorityScore: number;
  isGuaranteed: boolean;
  assumptionsJson: Record<string, any>;
  createdAt: string;
}

export interface EmployerProfileDetail {
  id: string;
  organizationWorkspaceId: string;
  companyName: string;
  slug: string;
  website?: string | null;
  logoUrl?: string | null;
  verifiedStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  industry: string;
  headquartersCity: string;
  firmTier: string;
  overviewText: string;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface EmployerVerificationDetail {
  id: string;
  employerProfileId: string;
  requestedByUserId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED';
  businessRegistrationNo: string;
  documentsJson: Record<string, any>;
  reviewerNotes?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface MentorProfileDetail {
  id: string;
  userId: string;
  fullName: string;
  headline: string;
  currentCompany: string;
  currentRole: string;
  yearsExperience: number;
  verifiedCA: boolean;
  icaiMembershipNo?: string | null;
  pathways: string[];
  bio: string;
  sessionDurationMinutes: number;
  hourlyRateInr: number;
  isAvailable: boolean;
  rating: number;
  totalSessionsCount: number;
}

export interface MentorBookingDetail {
  id: string;
  mentorProfileId: string;
  candidateUserId: string;
  candidateWorkspaceId: string;
  slotStartTime: string;
  slotEndTime: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  sessionNotes?: string | null;
  feedbackRating?: number | null;
  feedbackComments?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
}

export interface CommunityPostDetail {
  id: string;
  authorUserId: string;
  authorName: string;
  pathway: CAPathway;
  title: string;
  content: string;
  category: 'INTERVIEW_EXPERIENCE' | 'TECHNICAL_DEBATE' | 'CAREER_ADVICE' | 'GENERAL';
  isAnonymous: boolean;
  status: 'ACTIVE' | 'REPORTED' | 'FLAGGED_MODERATION' | 'REMOVED';
  upvotesCount: number;
  repliesCount: number;
  createdAt: string;
}

export interface CommunityReplyDetail {
  id: string;
  postId: string;
  authorUserId: string;
  authorName: string;
  content: string;
  isAnonymous: boolean;
  status: 'ACTIVE' | 'FLAGGED' | 'REMOVED';
  createdAt: string;
}

export interface CommunityReportDetail {
  id: string;
  reportedByUserId: string;
  resourceType: 'POST' | 'REPLY';
  resourceId: string;
  reason: 'SPAM' | 'HARASSMENT' | 'COMMERCIAL_SOLICITATION' | 'CONFIDENTIALITY_BREACH' | 'MISINFORMATION';
  status: 'PENDING_REVIEW' | 'ACTION_TAKEN' | 'DISMISSED';
  moderatorNotes?: string | null;
  createdAt: string;
}

export interface PostQualificationChecklistItem {
  id: string;
  userId: string;
  category: string;
  taskKey: string;
  title: string;
  description: string;
  officialPortalUrl: string;
  lastVerifiedDate: string;
  isCompleted: boolean;
  completedAt?: string | null;
  dueDate?: string | null;
  notes?: string | null;
}

export interface PracticeClientDetail {
  id: string;
  practiceWorkspaceId: string;
  clientName: string;
  entityType: string;
  panNumber?: string | null;
  gstin?: string | null;
  cin?: string | null;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: string;
  createdAt: string;
}

export interface PracticeComplianceTaskDetail {
  id: string;
  practiceWorkspaceId: string;
  clientId: string;
  title: string;
  complianceCategory: string;
  statutoryDueDate: string;
  internalDeadline: string;
  assignedToUserId?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW_PENDING' | 'FILED' | 'OVERDUE';
  financialYear: string;
  assessmentYear: string;
  filedReferenceNo?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface RecruitmentPipelineReviewDetail {
  id: string;
  applicationId: string;
  recruiterUserId: string;
  organizationWorkspaceId: string;
  pipelineStage: 'NEW' | 'IN_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
  internalNotes?: string | null;
  rating?: number | null;
  interviewScheduledAt?: string | null;
  interviewRoundsJson: any[];
  candidateNotified: boolean;
  updatedAt: string;
}

// =========================================================================
// Phase 6: SaaS Subscriptions, Entitlements & Billing Types
// =========================================================================

export type PlanTier = 'FREE_CANDIDATE' | 'PRO_CANDIDATE' | 'TEAM_EMPLOYER' | 'PRACTICE_CRM';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PENDING_PAYMENT'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'CANCELLED'
  | 'EXPIRED';

export interface PlanDetail {
  tier: PlanTier;
  name: string;
  description: string;
  priceInrMonthly: number;
  priceInrAnnual: number;
  features: string[];
  monthlyResumeLimit: number; // -1 for unlimited
  monthlyInterviewLimit: number; // -1 for unlimited
  maxActiveJobs: number; // 0 for candidates, 5 for team
  crmAccess: boolean;
  supportLevel: 'COMMUNITY' | 'PRIORITY' | 'DEDICATED';
}

export interface SubscriptionDetail {
  id: string;
  workspaceId: string;
  planTier: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd?: string | null;
  validUntil?: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEnd?: string | null;
  razorpaySubscriptionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSessionResult {
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: 'INR';
  planTier: PlanTier;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentTransactionDetail {
  id: string;
  subscriptionId: string;
  workspaceId: string;
  amountInr: number;
  currency: string;
  paymentMethod: string;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  errorMessage?: string | null;
  createdAt: string;
}

export interface InvoiceRecordDetail {
  id: string;
  subscriptionId: string;
  workspaceId: string;
  invoiceNumber: string;
  sacCode: string;
  subtotalInr: number;
  gstRatePct: number;
  gstAmountInr: number;
  totalAmountInr: number;
  b2bGstin?: string | null;
  issuedAt: string;
  status: 'PAID' | 'VOID' | 'REFUNDED';
}

export interface EntitlementCheckResult {
  allowed: boolean;
  tier: PlanTier;
  featureKey: string;
  currentUsage?: number;
  maxLimit?: number;
  message?: string;
}






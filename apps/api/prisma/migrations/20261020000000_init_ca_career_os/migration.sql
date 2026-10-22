-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'RECRUITER', 'MENTOR', 'ORG_ADMIN', 'PLATFORM_ADMIN');

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('PERSONAL', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'RECRUITER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CAPathway" AS ENUM ('AUDIT', 'TAX', 'FPA', 'CORP_FIN', 'IB', 'CONSULTING', 'PRACTICE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'PLANNED', 'TAILORED', 'APPLIED', 'ACKNOWLEDGED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PermissionTier" AS ENUM ('READ_ONLY', 'WRITE', 'EXPLICITLY_APPROVED_EXTERNAL', 'DESTRUCTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "type" "WorkspaceType" NOT NULL DEFAULT 'PERSONAL',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_memberships" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memberRole" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familyId" UUID NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_invitations" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "invitedById" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "planTier" TEXT NOT NULL DEFAULT 'FREE_CANDIDATE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMPTZ,
    "validUntil" TIMESTAMPTZ,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "gracePeriodEnd" TIMESTAMPTZ,
    "razorpayCustomerId" TEXT,
    "razorpaySubscriptionId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" TEXT NOT NULL DEFAULT 'UPI',
    "razorpayPaymentId" TEXT,
    "razorpayOrderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_records" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "sacCode" TEXT NOT NULL DEFAULT '998314',
    "subtotalInr" INTEGER NOT NULL,
    "gstRatePct" INTEGER NOT NULL DEFAULT 18,
    "gstAmountInr" INTEGER NOT NULL,
    "totalAmountInr" INTEGER NOT NULL,
    "b2bGstin" TEXT,
    "billingAddressJson" JSONB NOT NULL DEFAULT '{}',
    "issuedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PAID',

    CONSTRAINT "invoice_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_event_logs" (
    "id" UUID NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "processedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',

    CONSTRAINT "webhook_event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "icaiMembershipNo" TEXT,
    "qualificationDate" DATE,
    "caFinalStatus" TEXT NOT NULL DEFAULT 'QUALIFIED',
    "attemptsCount" INTEGER,
    "articleshipFirm" TEXT,
    "articleshipFirmTier" TEXT,
    "articleshipWeeks" INTEGER NOT NULL DEFAULT 156,
    "articleshipAreas" TEXT[],
    "skills" JSONB NOT NULL DEFAULT '[]',
    "softwareProficiencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredPathways" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetCities" TEXT[],
    "targetSalaryMin" INTEGER,
    "targetSalaryMax" INTEGER,
    "summary" TEXT,
    "profileCompletionPct" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_roadmaps" (
    "id" UUID NOT NULL,
    "candidateProfileId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "targetPathway" "CAPathway" NOT NULL,
    "overallFitScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "generatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "career_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_tasks" (
    "id" UUID NOT NULL,
    "roadmapId" UUID NOT NULL,
    "milestone" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMPTZ,
    "dueDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "employerId" UUID NOT NULL,
    "sourceId" UUID,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "locationCity" TEXT NOT NULL,
    "workArrangement" TEXT NOT NULL DEFAULT 'HYBRID',
    "caPathway" "CAPathway" NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryDisclosed" BOOLEAN NOT NULL DEFAULT false,
    "experienceMin" INTEGER NOT NULL DEFAULT 0,
    "experienceMax" INTEGER NOT NULL DEFAULT 3,
    "rawDescription" TEXT NOT NULL,
    "structuredRequirements" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL DEFAULT 'DIRECT_EMPLOYER',
    "sourceUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "fingerprint" TEXT NOT NULL DEFAULT '',
    "postedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" UUID NOT NULL,
    "candidateProfileId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "candidateProfileId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "resumeVersionId" UUID,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "coverNote" TEXT,
    "recruiterContact" JSONB NOT NULL DEFAULT '{}',
    "appliedAt" TIMESTAMPTZ,
    "statusUpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextFollowUpDate" TIMESTAMPTZ,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_status_history" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "fromStatus" "ApplicationStatus",
    "toStatus" "ApplicationStatus" NOT NULL,
    "notes" TEXT,
    "changedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_tasks" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMPTZ,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL,
    "candidateProfileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "targetPathway" "CAPathway" NOT NULL DEFAULT 'AUDIT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_versions" (
    "id" UUID NOT NULL,
    "resumeId" UUID NOT NULL,
    "targetedJobId" UUID,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'Version 1',
    "summary" TEXT,
    "tailoredJobTitle" TEXT,
    "tailoredCompanyName" TEXT,
    "matchScore" INTEGER,
    "s3Key" TEXT NOT NULL DEFAULT '',
    "pdfUrl" TEXT,
    "parsedContent" JSONB NOT NULL,
    "claimAttestations" JSONB NOT NULL DEFAULT '{}',
    "candidateAttested" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_entries" (
    "id" UUID NOT NULL,
    "candidateProfileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linkUrl" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "portfolio_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" UUID NOT NULL,
    "candidateProfileId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "targetPathway" "CAPathway" NOT NULL,
    "targetRole" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "overallScore" INTEGER,
    "feedback" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_question_items" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "questionText" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "candidateAnswer" TEXT,
    "score" INTEGER,
    "evaluation" JSONB,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "interview_question_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_conversations" (
    "id" UUID NOT NULL,
    "candidateProfileId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Career Consultation',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "agent_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_messages" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "approvalId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" UUID NOT NULL,
    "executionId" UUID NOT NULL,
    "requestedByUserId" UUID NOT NULL,
    "workspaceId" UUID,
    "toolName" TEXT NOT NULL DEFAULT '',
    "toolParameters" JSONB NOT NULL DEFAULT '{}',
    "actionPreview" TEXT NOT NULL DEFAULT '',
    "signedApprovalToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedAt" TIMESTAMPTZ,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "operation" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "payloadSha256" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_benchmarks" (
    "id" UUID NOT NULL,
    "pathway" "CAPathway" NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "experienceMin" INTEGER NOT NULL,
    "experienceMax" INTEGER NOT NULL,
    "locationCity" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "medianSalary" INTEGER NOT NULL,
    "p25Salary" INTEGER NOT NULL,
    "p75Salary" INTEGER NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "collectionPeriod" TEXT NOT NULL,
    "dataSourceProvenance" TEXT NOT NULL,
    "dataLimitations" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_comparisons" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "baseSalary" INTEGER NOT NULL,
    "variablePay" INTEGER NOT NULL DEFAULT 0,
    "variableConditions" TEXT,
    "bonus" INTEGER NOT NULL DEFAULT 0,
    "benefitsValue" INTEGER NOT NULL DEFAULT 0,
    "stockValue" INTEGER NOT NULL DEFAULT 0,
    "totalCtc" INTEGER NOT NULL,
    "monthlyNetEstimate" INTEGER NOT NULL,
    "locationCity" TEXT NOT NULL,
    "workArrangement" TEXT NOT NULL DEFAULT 'HYBRID',
    "learningPriorityScore" INTEGER NOT NULL DEFAULT 3,
    "isGuaranteed" BOOLEAN NOT NULL DEFAULT true,
    "assumptionsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employer_profiles" (
    "id" UUID NOT NULL,
    "organizationWorkspaceId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "verifiedStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "industry" TEXT NOT NULL,
    "headquartersCity" TEXT NOT NULL,
    "firmTier" TEXT NOT NULL DEFAULT 'MID_SIZE',
    "overviewText" TEXT NOT NULL,
    "verifiedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "employer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employer_verification_requests" (
    "id" UUID NOT NULL,
    "employerProfileId" UUID NOT NULL,
    "requestedByUserId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "businessRegistrationNo" TEXT NOT NULL,
    "documentsJson" JSONB NOT NULL DEFAULT '{}',
    "reviewerNotes" TEXT,
    "reviewedByUserId" UUID,
    "reviewedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "employer_verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "currentCompany" TEXT NOT NULL,
    "currentRole" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "verifiedCA" BOOLEAN NOT NULL DEFAULT true,
    "icaiMembershipNo" TEXT,
    "pathways" TEXT[],
    "bio" TEXT NOT NULL,
    "sessionDurationMinutes" INTEGER NOT NULL DEFAULT 45,
    "hourlyRateInr" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "totalSessionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_bookings" (
    "id" UUID NOT NULL,
    "mentorProfileId" UUID NOT NULL,
    "candidateUserId" UUID NOT NULL,
    "candidateWorkspaceId" UUID NOT NULL,
    "slotStartTime" TIMESTAMPTZ NOT NULL,
    "slotEndTime" TIMESTAMPTZ NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "sessionNotes" TEXT,
    "feedbackRating" INTEGER,
    "feedbackComments" TEXT,
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "mentor_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "authorName" TEXT NOT NULL,
    "pathway" "CAPathway" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "upvotesCount" INTEGER NOT NULL DEFAULT 0,
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_replies" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_reports" (
    "id" UUID NOT NULL,
    "reportedByUserId" UUID NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "moderatorNotes" TEXT,
    "reviewedByUserId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "community_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_qualification_checklists" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "taskKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "officialPortalUrl" TEXT NOT NULL,
    "lastVerifiedDate" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMPTZ,
    "dueDate" TIMESTAMPTZ,
    "notes" TEXT,

    CONSTRAINT "post_qualification_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_clients" (
    "id" UUID NOT NULL,
    "practiceWorkspaceId" UUID NOT NULL,
    "clientName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "panNumber" TEXT,
    "gstin" TEXT,
    "cin" TEXT,
    "contactPerson" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "practice_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_compliance_tasks" (
    "id" UUID NOT NULL,
    "practiceWorkspaceId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "complianceCategory" TEXT NOT NULL,
    "statutoryDueDate" TIMESTAMPTZ NOT NULL,
    "internalDeadline" TIMESTAMPTZ NOT NULL,
    "assignedToUserId" UUID,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "financialYear" TEXT NOT NULL,
    "assessmentYear" TEXT NOT NULL,
    "filedReferenceNo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "practice_compliance_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_application_reviews" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "recruiterUserId" UUID NOT NULL,
    "organizationWorkspaceId" UUID NOT NULL,
    "pipelineStage" TEXT NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "rating" INTEGER,
    "interviewScheduledAt" TIMESTAMPTZ,
    "interviewRoundsJson" JSONB NOT NULL DEFAULT '[]',
    "candidateNotified" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "recruitment_application_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspaces_slug_idx" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspace_memberships_workspaceId_idx" ON "workspace_memberships"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_memberships_userId_idx" ON "workspace_memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_memberships_workspaceId_userId_key" ON "workspace_memberships"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitations_token_key" ON "workspace_invitations"("token");

-- CreateIndex
CREATE INDEX "workspace_invitations_workspaceId_idx" ON "workspace_invitations"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_invitations_email_idx" ON "workspace_invitations"("email");

-- CreateIndex
CREATE INDEX "workspace_invitations_token_idx" ON "workspace_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_workspaceId_key" ON "subscriptions"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_razorpayPaymentId_key" ON "payment_transactions"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_idempotencyKey_key" ON "payment_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payment_transactions_workspaceId_idx" ON "payment_transactions"("workspaceId");

-- CreateIndex
CREATE INDEX "payment_transactions_subscriptionId_idx" ON "payment_transactions"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_records_invoiceNumber_key" ON "invoice_records"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_records_workspaceId_idx" ON "invoice_records"("workspaceId");

-- CreateIndex
CREATE INDEX "invoice_records_subscriptionId_idx" ON "invoice_records"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_event_logs_eventId_key" ON "webhook_event_logs"("eventId");

-- CreateIndex
CREATE INDEX "webhook_event_logs_eventId_idx" ON "webhook_event_logs"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_userId_key" ON "candidate_profiles"("userId");

-- CreateIndex
CREATE INDEX "candidate_profiles_workspaceId_idx" ON "candidate_profiles"("workspaceId");

-- CreateIndex
CREATE INDEX "career_roadmaps_candidateProfileId_idx" ON "career_roadmaps"("candidateProfileId");

-- CreateIndex
CREATE INDEX "career_roadmaps_workspaceId_idx" ON "career_roadmaps"("workspaceId");

-- CreateIndex
CREATE INDEX "career_tasks_roadmapId_idx" ON "career_tasks"("roadmapId");

-- CreateIndex
CREATE INDEX "jobs_status_expiresAt_idx" ON "jobs"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "jobs_normalizedTitle_idx" ON "jobs"("normalizedTitle");

-- CreateIndex
CREATE INDEX "jobs_locationCity_idx" ON "jobs"("locationCity");

-- CreateIndex
CREATE INDEX "jobs_caPathway_idx" ON "jobs"("caPathway");

-- CreateIndex
CREATE INDEX "jobs_fingerprint_idx" ON "jobs"("fingerprint");

-- CreateIndex
CREATE INDEX "saved_jobs_candidateProfileId_idx" ON "saved_jobs"("candidateProfileId");

-- CreateIndex
CREATE INDEX "saved_jobs_jobId_idx" ON "saved_jobs"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_candidateProfileId_jobId_key" ON "saved_jobs"("candidateProfileId", "jobId");

-- CreateIndex
CREATE INDEX "applications_candidateProfileId_idx" ON "applications"("candidateProfileId");

-- CreateIndex
CREATE INDEX "applications_jobId_idx" ON "applications"("jobId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "application_status_history_applicationId_idx" ON "application_status_history"("applicationId");

-- CreateIndex
CREATE INDEX "follow_up_tasks_applicationId_idx" ON "follow_up_tasks"("applicationId");

-- CreateIndex
CREATE INDEX "resumes_candidateProfileId_idx" ON "resumes"("candidateProfileId");

-- CreateIndex
CREATE INDEX "resume_versions_resumeId_idx" ON "resume_versions"("resumeId");

-- CreateIndex
CREATE INDEX "portfolio_entries_candidateProfileId_idx" ON "portfolio_entries"("candidateProfileId");

-- CreateIndex
CREATE INDEX "interview_sessions_candidateProfileId_idx" ON "interview_sessions"("candidateProfileId");

-- CreateIndex
CREATE INDEX "interview_sessions_workspaceId_idx" ON "interview_sessions"("workspaceId");

-- CreateIndex
CREATE INDEX "interview_question_items_sessionId_idx" ON "interview_question_items"("sessionId");

-- CreateIndex
CREATE INDEX "agent_conversations_candidateProfileId_idx" ON "agent_conversations"("candidateProfileId");

-- CreateIndex
CREATE INDEX "agent_conversations_workspaceId_idx" ON "agent_conversations"("workspaceId");

-- CreateIndex
CREATE INDEX "agent_messages_conversationId_idx" ON "agent_messages"("conversationId");

-- CreateIndex
CREATE INDEX "approval_requests_requestedByUserId_idx" ON "approval_requests"("requestedByUserId");

-- CreateIndex
CREATE INDEX "approval_requests_expiresAt_idx" ON "approval_requests"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_events_workspaceId_createdAt_idx" ON "audit_events"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_correlationId_idx" ON "audit_events"("correlationId");

-- CreateIndex
CREATE INDEX "salary_benchmarks_pathway_locationCity_idx" ON "salary_benchmarks"("pathway", "locationCity");

-- CreateIndex
CREATE INDEX "salary_benchmarks_roleTitle_idx" ON "salary_benchmarks"("roleTitle");

-- CreateIndex
CREATE INDEX "offer_comparisons_userId_idx" ON "offer_comparisons"("userId");

-- CreateIndex
CREATE INDEX "offer_comparisons_workspaceId_idx" ON "offer_comparisons"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "employer_profiles_slug_key" ON "employer_profiles"("slug");

-- CreateIndex
CREATE INDEX "employer_profiles_organizationWorkspaceId_idx" ON "employer_profiles"("organizationWorkspaceId");

-- CreateIndex
CREATE INDEX "employer_verification_requests_employerProfileId_idx" ON "employer_verification_requests"("employerProfileId");

-- CreateIndex
CREATE INDEX "employer_verification_requests_status_idx" ON "employer_verification_requests"("status");

-- CreateIndex
CREATE INDEX "mentor_profiles_userId_idx" ON "mentor_profiles"("userId");

-- CreateIndex
CREATE INDEX "mentor_bookings_mentorProfileId_slotStartTime_idx" ON "mentor_bookings"("mentorProfileId", "slotStartTime");

-- CreateIndex
CREATE INDEX "mentor_bookings_candidateUserId_idx" ON "mentor_bookings"("candidateUserId");

-- CreateIndex
CREATE INDEX "community_posts_pathway_category_idx" ON "community_posts"("pathway", "category");

-- CreateIndex
CREATE INDEX "community_posts_authorUserId_idx" ON "community_posts"("authorUserId");

-- CreateIndex
CREATE INDEX "community_replies_postId_idx" ON "community_replies"("postId");

-- CreateIndex
CREATE INDEX "community_reports_resourceId_idx" ON "community_reports"("resourceId");

-- CreateIndex
CREATE INDEX "community_reports_status_idx" ON "community_reports"("status");

-- CreateIndex
CREATE INDEX "post_qualification_checklists_userId_category_idx" ON "post_qualification_checklists"("userId", "category");

-- CreateIndex
CREATE INDEX "practice_clients_practiceWorkspaceId_idx" ON "practice_clients"("practiceWorkspaceId");

-- CreateIndex
CREATE INDEX "practice_compliance_tasks_practiceWorkspaceId_statutoryDueD_idx" ON "practice_compliance_tasks"("practiceWorkspaceId", "statutoryDueDate");

-- CreateIndex
CREATE INDEX "practice_compliance_tasks_clientId_idx" ON "practice_compliance_tasks"("clientId");

-- CreateIndex
CREATE INDEX "recruitment_application_reviews_applicationId_idx" ON "recruitment_application_reviews"("applicationId");

-- CreateIndex
CREATE INDEX "recruitment_application_reviews_organizationWorkspaceId_pip_idx" ON "recruitment_application_reviews"("organizationWorkspaceId", "pipelineStage");

-- AddForeignKey
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_records" ADD CONSTRAINT "invoice_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_roadmaps" ADD CONSTRAINT "career_roadmaps_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_tasks" ADD CONSTRAINT "career_tasks_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "career_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_tasks" ADD CONSTRAINT "follow_up_tasks_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_entries" ADD CONSTRAINT "portfolio_entries_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_question_items" ADD CONSTRAINT "interview_question_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_messages" ADD CONSTRAINT "agent_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "agent_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employer_verification_requests" ADD CONSTRAINT "employer_verification_requests_employerProfileId_fkey" FOREIGN KEY ("employerProfileId") REFERENCES "employer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_bookings" ADD CONSTRAINT "mentor_bookings_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_replies" ADD CONSTRAINT "community_replies_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_compliance_tasks" ADD CONSTRAINT "practice_compliance_tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "practice_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;


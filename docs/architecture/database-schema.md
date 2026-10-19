# CA Career OS — Database Architecture & Schema Specification

> **Document Type:** Persistence Tier & Schema Engineering Specification  
> **Status:** Approved Baseline — Implementation Pending (Prisma Schema Ready for Migration Testing)  
> **Audience:** Database Architects, Backend Engineers, DevSecOps  

---

## 1. Persistence Overview & Technology Baseline

CA Career OS utilizes **PostgreSQL 16+** managed via **Prisma ORM** as its primary persistence engine, extended with the **`pgvector`** extension for unified relational and 1536-dimensional semantic vector queries.

### Key Architectural Standards
- **Primary Keys:** UUIDv7 (time-ordered) or UUIDv4 generated at application layer.
- **Tenant Scoping:** All critical entities carry an indexed `workspaceId` foreign key.
- **Soft Deletion:** Core entities contain a nullable `deletedAt` timestamp; queries filter `where: { deletedAt: null }`.
- **Audit Columns:** Every table includes `createdAt` and `updatedAt` timestamps with automated database triggers.
- **Index Strategy:** B-tree on primary and foreign keys; GIN indexes on PostgreSQL full-text search vectors and JSONB tags; HNSW indexes on `pgvector` embeddings.

> **Implementation Disclaimer:** This specification defines the target PostgreSQL relational schema and representative Prisma models. It has not yet been executed as production migrations and must undergo performance load testing and migration sequence validation during Phase 1 sprint execution.

---

## 2. Representative Prisma Schema (Critical MVP Relationships)

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum UserRole {
  CANDIDATE
  RECRUITER
  MENTOR
  ORG_ADMIN
  PLATFORM_ADMIN
}

enum WorkspaceType {
  PERSONAL
  ORGANIZATION
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
  RECRUITER
  VIEWER
}

enum CAPathway {
  AUDIT
  TAX
  FPA
  CORP_FIN
  IB
  CONSULTING
  PRACTICE
}

enum ApplicationStatus {
  SAVED
  TAILORED
  APPLIED
  ACKNOWLEDGED
  INTERVIEWING
  OFFERED
  REJECTED
  WITHDRAWN
}

enum PermissionTier {
  READ_ONLY
  WRITE
  EXPLICITLY_APPROVED_EXTERNAL
  DESTRUCTIVE
}

model User {
  id             String                @id @default(uuid()) @db.Uuid
  email          String                @unique
  hashedPassword String
  firstName      String
  lastName       String
  role           UserRole              @default(CANDIDATE)
  emailVerified  Boolean               @default(false)
  createdAt      DateTime              @default(now()) @db.Timestamptz
  updatedAt      DateTime              @updatedAt @db.Timestamptz
  deletedAt      DateTime?             @db.Timestamptz

  memberships    WorkspaceMembership[]
  candidate      CandidateProfile?
  auditEvents    AuditEvent[]

  @@index([email])
  @@index([deletedAt])
  @@map("users")
}

model Workspace {
  id          String                @id @default(uuid()) @db.Uuid
  type        WorkspaceType         @default(PERSONAL)
  name        String
  slug        String                @unique
  ownerId     String                @db.Uuid
  settings    Json                  @default("{}")
  createdAt   DateTime              @default(now()) @db.Timestamptz

  memberships WorkspaceMembership[]
  subscription Subscription?
  auditEvents AuditEvent[]

  @@index([slug])
  @@map("workspaces")
}

model WorkspaceMembership {
  id          String     @id @default(uuid()) @db.Uuid
  workspaceId String     @db.Uuid
  userId      String     @db.Uuid
  memberRole  MemberRole @default(MEMBER)
  isDefault   Boolean    @default(false)
  joinedAt    DateTime   @default(now()) @db.Timestamptz

  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@index([workspaceId])
  @@index([userId])
  @@map("workspace_memberships")
}

model CandidateProfile {
  id                String             @id @default(uuid()) @db.Uuid
  userId            String             @unique @db.Uuid
  workspaceId       String             @db.Uuid
  icaiMembershipNo  String?
  qualificationDate DateTime?          @db.Date
  articleshipFirm   String?
  articleshipAreas  String[]
  targetCities      String[]
  targetSalaryMin   Int?
  targetSalaryMax   Int?
  summary           String?            @db.Text
  updatedAt         DateTime           @updatedAt @db.Timestamptz

  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  skills            CandidateSkill[]
  gapReports        SkillGapReport[]
  learningTasks     LearningTask[]
  resumes           Resume[]
  applications      Application[]
  interviewSessions InterviewSession[]

  @@index([workspaceId])
  @@map("candidate_profiles")
}

model Job {
  id                     String                 @id @default(uuid()) @db.Uuid
  employerId             String                 @db.Uuid
  sourceId               String?                @db.Uuid
  title                  String
  normalizedTitle        String
  companyName            String
  locationCity           String
  caPathway              CAPathway
  salaryMin              Int?
  salaryMax              Int?
  salaryDisclosed        Boolean                @default(false)
  rawDescription         String                 @db.Text
  structuredRequirements Json                   @default("{}")
  embedding              Unsupported("vector")?
  status                 String                 @default("ACTIVE")
  postedAt               DateTime               @default(now()) @db.Timestamptz
  expiresAt              DateTime               @db.Timestamptz

  applications           Application[]
  matches                JobMatch[]

  @@index([status, expiresAt])
  @@index([normalizedTitle])
  @@index([locationCity])
  @@map("jobs")
}

model Application {
  id                 String            @id @default(uuid()) @db.Uuid
  candidateProfileId String            @db.Uuid
  jobId              String            @db.Uuid
  resumeVersionId    String?           @db.Uuid
  status             ApplicationStatus @default(SAVED)
  coverNote          String?           @db.Text
  appliedAt          DateTime?         @db.Timestamptz
  statusUpdatedAt    DateTime          @default(now()) @db.Timestamptz
  nextFollowUpDate   DateTime?         @db.Timestamptz

  candidate          CandidateProfile  @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)
  job                Job               @relation(fields: [jobId], references: [id], onDelete: Cascade)
  resumeVersion      ResumeVersion?    @relation(fields: [resumeVersionId], references: [id], onDelete: SetNull)

  @@index([candidateProfileId])
  @@index([jobId])
  @@index([status])
  @@map("applications")
}

model ResumeVersion {
  id                String        @id @default(uuid()) @db.Uuid
  resumeId          String        @db.Uuid
  targetedJobId     String?       @db.Uuid
  s3Key             String
  pdfUrl            String?
  parsedContent     Json
  claimAttestations Json          @default("{}")
  candidateAttested Boolean       @default(false)
  createdAt         DateTime      @default(now()) @db.Timestamptz

  applications      Application[]

  @@index([resumeId])
  @@map("resume_versions")
}

model ApprovalRequest {
  id                  String         @id @default(uuid()) @db.Uuid
  executionId         String         @db.Uuid
  requestedByUserId   String         @db.Uuid
  signedApprovalToken String         @db.Text
  expiresAt           DateTime       @db.Timestamptz
  decision            String         @default("PENDING")
  decidedAt           DateTime?      @db.Timestamptz

  @@index([requestedByUserId])
  @@index([expiresAt])
  @@map("approval_requests")
}

model AuditEvent {
  id            String    @id @default(uuid()) @db.Uuid
  actorId       String    @db.Uuid
  workspaceId   String    @db.Uuid
  operation     String
  resourceType  String
  resourceId    String
  outcome       String
  correlationId String
  payloadSha256 String
  durationMs    Int
  createdAt     DateTime  @default(now()) @db.Timestamptz

  user          User      @relation(fields: [actorId], references: [id], onDelete: Restrict)
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Restrict)

  @@index([workspaceId, createdAt])
  @@index([correlationId])
  @@map("audit_events")
}
```

---

## 3. Migration Sequencing & Data Integrity Rules

1. **Phase 1 (Extension & Enums):** Activate `pgvector` extension; create all enum types.
2. **Phase 2 (Identity & Workspaces):** Run migrations for `users`, `workspaces`, `workspace_memberships`, `subscriptions`.
3. **Phase 3 (Candidate & Skills):** Create `candidate_profiles`, `skills`, `candidate_skills`, `skill_gap_reports`, `learning_tasks`.
4. **Phase 4 (Jobs & Recruitment):** Create `employers`, `job_sources`, `jobs`, `job_matches`, `applications`.
5. **Phase 5 (Resumes & Interviews):** Create `resumes`, `resume_versions`, `interview_sessions`, `interview_feedbacks`.
6. **Phase 6 (Agent & Audit):** Create `approval_requests`, `idempotency_records`, `audit_events`.
7. **Indexes & HNSW Setup:** Create HNSW index using raw SQL migration:
   ```sql
   CREATE INDEX idx_jobs_embedding ON jobs USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
   ```

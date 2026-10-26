-- Multi-Source Job & Articleship Aggregator Migration
-- Additive migration for external feeds, ATS connectors, freshness verification, and duplicate clusters

ALTER TABLE "jobs"
ADD COLUMN IF NOT EXISTS "opportunityType" TEXT NOT NULL DEFAULT 'QUALIFIED_CA',
ADD COLUMN IF NOT EXISTS "channel" TEXT NOT NULL DEFAULT 'ENTERPRISE',
ADD COLUMN IF NOT EXISTS "sourceProvider" TEXT NOT NULL DEFAULT 'DIRECT_EMPLOYER',
ADD COLUMN IF NOT EXISTS "externalJobId" TEXT,
ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT,
ADD COLUMN IF NOT EXISTS "applicationUrl" TEXT,
ADD COLUMN IF NOT EXISTS "attribution" TEXT,
ADD COLUMN IF NOT EXISTS "originalPostedAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "firstSeenAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'SOURCE_ACTIVE',
ADD COLUMN IF NOT EXISTS "duplicateClusterId" UUID,
ADD COLUMN IF NOT EXISTS "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "duplicateOfJobId" UUID;

-- Indexes for Aggregator Search & Filtering
CREATE INDEX IF NOT EXISTS "jobs_opportunityType_idx" ON "jobs"("opportunityType");
CREATE INDEX IF NOT EXISTS "jobs_channel_idx" ON "jobs"("channel");
CREATE INDEX IF NOT EXISTS "jobs_sourceProvider_idx" ON "jobs"("sourceProvider");
CREATE INDEX IF NOT EXISTS "jobs_verificationStatus_idx" ON "jobs"("verificationStatus");
CREATE INDEX IF NOT EXISTS "jobs_externalJobId_idx" ON "jobs"("externalJobId");

-- CreateTable: job_source_configs
CREATE TABLE IF NOT EXISTS "job_source_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "endpoint" TEXT,
    "organizationSlug" TEXT,
    "apiKeyConfigured" BOOLEAN NOT NULL DEFAULT false,
    "allowedGeography" TEXT NOT NULL DEFAULT 'IN',
    "pollingIntervalMinutes" INTEGER NOT NULL DEFAULT 60,
    "lastSyncAt" TIMESTAMPTZ,
    "lastSuccessAt" TIMESTAMPTZ,
    "lastFailureAt" TIMESTAMPTZ,
    "lastErrorMessage" TEXT,
    "totalFetched" INTEGER NOT NULL DEFAULT 0,
    "totalIngested" INTEGER NOT NULL DEFAULT 0,
    "totalDuplicates" INTEGER NOT NULL DEFAULT 0,
    "totalExpired" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_source_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "job_source_configs_name_key" ON "job_source_configs"("name");

-- CreateTable: job_sync_audits
CREATE TABLE IF NOT EXISTS "job_sync_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceConfigId" UUID NOT NULL,
    "triggerType" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "fetchedCount" INTEGER NOT NULL DEFAULT 0,
    "ingestedCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateCount" INTEGER NOT NULL DEFAULT 0,
    "staleCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ,

    CONSTRAINT "job_sync_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "job_sync_audits_sourceConfigId_idx" ON "job_sync_audits"("sourceConfigId");
CREATE INDEX IF NOT EXISTS "job_sync_audits_startedAt_idx" ON "job_sync_audits"("startedAt");

-- AddForeignKey
ALTER TABLE "job_sync_audits"
ADD CONSTRAINT "job_sync_audits_sourceConfigId_fkey"
FOREIGN KEY ("sourceConfigId") REFERENCES "job_source_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

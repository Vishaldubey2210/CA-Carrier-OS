-- CreateTable
CREATE TABLE "annotations" (
    "id" TEXT NOT NULL,
    "task_type" TEXT NOT NULL,
    "review_status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "annotator_id" TEXT NOT NULL,
    "annotator_name" TEXT NOT NULL,
    "guidelines_version" TEXT NOT NULL DEFAULT 'v2.0.0',
    "data" JSONB NOT NULL,
    "audit_log" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "annotations_task_type_idx" ON "annotations"("task_type");

-- CreateIndex
CREATE INDEX "annotations_review_status_idx" ON "annotations"("review_status");

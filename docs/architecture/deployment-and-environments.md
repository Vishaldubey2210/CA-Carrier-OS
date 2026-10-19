# CA Career OS — Deployment Architecture & Environment Management

> **Document Type:** Platform Engineering, DevOps & Environment Management  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** DevSecOps Engineers, Platform Engineers, System Administrators  

---

## 1. Environment Tiering Matrix

CA Career OS operates across 4 isolated environment tiers. **No production credentials or secrets are ever shared with lower environments.**

| Environment | Purpose | Infrastructure Hosting | Database Tier | AI Provider Tier | Secret Store |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Local Dev** | Local engineer workstations | Docker Compose (Node.js, Postgres, Redis, MinIO) | Local container with seed data | Mock Adapter or personal dev API keys | `.env.local` (Git-ignored) |
| **Test / CI** | Automated testing on every PR | GitHub Actions ephemeral runners | Ephemeral Testcontainers (Postgres 16+, Redis 7+) | Mock LLM responses (Deterministic JSON) | GitHub Encrypted Secrets |
| **Staging** | Pre-production validation & QA | AWS ECS Fargate (`ap-south-1`) | Aurora Serverless PostgreSQL + ElastiCache | Staging quota API keys (ZDR enabled) | AWS Secrets Manager (`staging/ca-career-os/*`) |
| **Production** | Live SaaS operations | AWS ECS Fargate Multi-AZ (`ap-south-1`) | Aurora Multi-AZ + ElastiCache Cluster | Enterprise ZDR contractual accounts | AWS Secrets Manager (`prod/ca-career-os/*`) |

---

## 2. Environment Variables & Secret Configuration

```ini
# Core Application Configuration
NODE_ENV=production
PORT=4000
APP_BASE_URL=https://cacareeros.com
API_BASE_URL=https://api.cacareeros.com

# Database & Cache (Secrets Manager Managed)
DATABASE_URL=postgresql://app_user:${DB_PASSWORD}@aurora-cluster.internal:5432/ca_career_os?schema=public&sslmode=require
REDIS_URL=rediss://:${REDIS_AUTH}@elasticache-cluster.internal:6379

# Cryptographic Keys (RS256 JWT & Approval Signatures)
JWT_PUBLIC_KEY_PEM="-----BEGIN PUBLIC KEY-----..."
JWT_PRIVATE_KEY_PEM="-----BEGIN RSA PRIVATE KEY-----..."
APPROVAL_TOKEN_SECRET="[KMS-MANAGED-HMAC-KEY]"

# Object Storage (S3 / R2)
S3_BUCKET_NAME=ca-career-os-documents-prod
S3_REGION=ap-south-1
AWS_KMS_KEY_ID=arn:aws:kms:ap-south-1:123456789012:key/abc-123

# External Integrations (Encrypted in Secrets Manager)
GEMINI_API_KEY="${SECRET_GEMINI_KEY}"
ANTHROPIC_API_KEY="${SECRET_CLAUDE_KEY}"
OPENAI_API_KEY="${SECRET_OPENAI_KEY}"
RESEND_API_KEY="${SECRET_RESEND_KEY}"
TWILIO_AUTH_TOKEN="${SECRET_TWILIO_KEY}"
RAZORPAY_KEY_ID="${SECRET_RAZORPAY_ID}"
RAZORPAY_KEY_SECRET="${SECRET_RAZORPAY_SECRET}"
RAZORPAY_WEBHOOK_SECRET="${SECRET_RAZORPAY_WEBHOOK}"
```

---

## 3. Database Migration Sequencing & Safe Schema Evolution

### Zero-Downtime Migration Rules
1. **Expand-Contract Pattern:** Destructive schema changes (renaming columns, dropping tables) require two separate deployment cycles:
   - *Cycle 1 (Expand):* Add new column as nullable; dual-write in application code; backfill old rows via background script.
   - *Cycle 2 (Contract):* Switch reads to new column; remove old column from Prisma schema and drop in migration.
2. **Migration Pipeline:**
   - Migrations are generated via `prisma migrate dev` locally.
   - Migrations are tested against Testcontainers in CI.
   - Staging and Production execute `prisma migrate deploy` as a pre-deployment step prior to rolling container updates.
3. **Rollback Limitations:** Because database migrations cannot always be rolled back without data loss, breaking migrations are prohibited in non-maintenance windows. Backward-compatible schema design is mandatory.

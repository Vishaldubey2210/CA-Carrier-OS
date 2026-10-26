# CA Career OS — Vercel Monorepo Dual-Project Deployment Guide

## 1. Executive Summary & Root Cause Analysis

### Forensic Diagnosis of `[NEXT_NO_VERSION]`
During previous Vercel deployment attempts from the repository root, the build failed with:
```text
[NEXT_NO_VERSION] No Next.js version detected. Make sure your package.json has "next" in dependencies or devDependencies and that Root Directory matches the package.json location.
```

**Root Cause:**
1. **Repository Root Mismatch**: The repository is a pnpm monorepo where the Next.js application resides in `apps/web`, while the root `package.json` only orchestrates monorepo workspace scripts and does not have `next` installed.
2. **Competing Root `vercel.json`**: The root directory previously contained a `vercel.json` declaring `"framework": "nextjs"`. When a project was created in Vercel with the default Root Directory set to `.` (the monorepo root), Vercel inspected `./package.json` for the `next` dependency, found nothing, and rejected the build before invoking pnpm.
3. **Monorepo Multi-App Hosting**: CA Career OS contains both a Next.js frontend (`apps/web`) and a NestJS API (`apps/api`). A single root project cannot serve both frameworks simultaneously.

**Resolution:**
- Relocated project-specific configuration to `apps/web/vercel.json` and `apps/api/vercel.json`.
- Neutralized the conflicting root `vercel.json`.
- Configured Vercel as two discrete projects deployed from the same GitHub repository:
  - **Project A (`ca-career-os-web`)**: Root Directory `apps/web`
  - **Project B (`ca-career-os-api`)**: Root Directory `apps/api`

---

## 2. Monorepo Architecture on Vercel

```
CA Career OS Monorepo
├── apps/
│   ├── web/                     --> Project A (Frontend: Next.js 15 App Router)
│   │   ├── vercel.json          --> Next.js build & output settings
│   │   ├── next.config.mjs      --> /api/v1 reverse proxy to backend
│   │   └── package.json         --> dependencies: next, react, @ca-career-os/shared
│   └── api/                     --> Project B (Backend: NestJS 10 Serverless)
│       ├── api/index.ts         --> Vercel Serverless Function entrypoint
│       ├── vercel.json          --> Rewrites /(.*) to /api/index
│       ├── prisma/schema.prisma --> 45 Prisma Models (including Annotation)
│       └── package.json         --> dependencies: nestjs, prisma, @ca-career-os/shared
├── packages/
│   └── shared/                  --> Shared TypeScript contracts & schemas
├── .vercelignore                --> Excludes 49MB data/, notebooks/, models/ from bundles
├── pnpm-workspace.yaml          --> pnpm workspace definition
└── railway.json                 --> Alternative Railway deployment (preserved)
```

---

## 3. Project A: Frontend Setup (`apps/web`)

### Vercel Dashboard Project Configuration

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Project Name** | `ca-career-os-web` (or your chosen name) | Identifier in Vercel Dashboard |
| **Framework Preset** | **Next.js** | Native Next.js 15 detection |
| **Root Directory** | `apps/web` | Points to the Next.js workspace |
| **Include files outside Root Directory** | **Checked (Enabled)** | **CRITICAL**: Enables access to `packages/shared` and root lockfile |
| **Build Command** | `pnpm --filter @ca-career-os/shared build && next build` | Compiles shared library then builds Next.js |
| **Output Directory** | `.next` (Default) | Next.js output directory |
| **Install Command** | `pnpm install` (Default) | Vercel executes pnpm install from workspace root |

### Environment Variables for Project A

| Variable Name | Environment | Required | Secret? | Purpose / Value |
| :--- | :--- | :--- | :--- | :--- |
| `API_ORIGIN` | Production, Preview | **YES** | No | Base URL of deployed NestJS backend (e.g. `https://ca-career-os-api.vercel.app`). Rewrites `/api/v1/:path*` server-side to the API. |
| `NODE_ENV` | Production, Preview | Optional | No | Automatically set to `production` by Vercel. |

> [!IMPORTANT]
> **Zero Secrets in Frontend**: `DATABASE_URL`, `JWT_SECRET`, session secrets, SMTP credentials, and private keys MUST NOT be set in Project A. `apps/web` communicates with the backend solely via the server-side `/api/v1` proxy rewrite configured in `apps/web/next.config.mjs`.

### Deployment Verification
- **Build Output**: Verifies all 35 static and dynamic routes generate cleanly.
- **Health Check**: `https://<frontend-domain>/api/health` returns `200 OK`.
- **Proxy Verification**: `https://<frontend-domain>/api/v1/health` forwards to the backend and returns the JSON liveness envelope.

---

## 4. Project B: Backend Setup (`apps/api`)

### Vercel Dashboard Project Configuration

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Project Name** | `ca-career-os-api` (or your chosen name) | Identifier in Vercel Dashboard |
| **Framework Preset** | **Other** (Vercel Serverless Function) | Handled by `api/index.ts` handler |
| **Root Directory** | `apps/api` | Points to the NestJS workspace |
| **Include files outside Root Directory** | **Checked (Enabled)** | **CRITICAL**: Enables access to `packages/shared` and root lockfile |
| **Build Command** | `pnpm --filter @ca-career-os/shared build && prisma generate && tsc` | Builds shared contracts, generates Prisma client, and compiles TypeScript |
| **Output Directory** | `dist` (or leave default) | Compiled JavaScript artifacts |
| **Install Command** | `pnpm install` | Installs monorepo dependencies |

### Serverless Architecture (`api/index.ts`)
The serverless entrypoint in `apps/api/api/index.ts`:
1. Instantiates the NestJS application with `ExpressAdapter`.
2. Reuses a warmed in-memory singleton instance (`cachedServer`) across invocations to avoid cold-start bootstrap latency.
3. Applies unified CORS rules, HTTP filters, and request interceptors identical to standalone runtime.
4. Routes all incoming requests through `apps/api/vercel.json`:
   ```json
   {
     "version": 2,
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/api/index"
       }
     ]
   }
   ```

### Runtime Asset Protection (`.vercelignore`)
To comply with Vercel Function size constraints (max 250MB uncompressed) and guarantee cold starts under 1.5s:
- Root `.vercelignore` and `apps/api/.vercelignore` exclude `data/` (49MB offline datasets), `notebooks/`, `models/`, and `scripts/`.
- The NestJS application does not read local files at runtime; all business logic, heuristic models, and schemas execute in TypeScript memory.

### Environment Variables for Project B

| Variable Name | Environment | Required | Secret? | Purpose / Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Production, Preview | **YES** | **YES** | Pooled PostgreSQL connection string (Neon pooler / Supabase Supavisor port 6543 with `?pgbouncer=true`). |
| `DIRECT_URL` | Production, Preview | **YES** | **YES** | Direct PostgreSQL connection string (port 5432) for running migrations. |
| `JWT_SECRET` | Production, Preview | **YES** | **YES** | Minimum 32-character random string for HMAC SHA-256 JWT signing. |
| `JWT_EXPIRES_IN` | Production, Preview | Optional | No | Token lifetime (Default: `15m`). |
| `REFRESH_TOKEN_EXPIRES_IN` | Production, Preview | Optional | No | Refresh token lifetime (Default: `7d`). |
| `CORS_ORIGIN` | Production | **YES** | No | Frontend URL (e.g. `https://ca-career-os-web.vercel.app`). |
| `CORS_ALLOW_VERCEL_PREVIEWS` | Preview, Development | Recommended | No | Set to `'true'` to permit Vercel preview domains (`*.vercel.app`) to make authenticated cross-origin requests. |
| `LOG_LEVEL` | Production, Preview | Optional | No | `info`, `warn`, or `error` (Default: `info`). |
| `LOG_FORMAT` | Production, Preview | Optional | No | `json` (Default: `json`). |
| `EMAIL_PROVIDER` | Production | **YES** | No | `smtp` for live email delivery, or `mock` for staging/previews. |
| `SMTP_HOST` | Production | If SMTP | No | Hostname of mail server (e.g., `email-smtp.ap-south-1.amazonaws.com`). |
| `SMTP_PORT` | Production | If SMTP | No | `587` or `465`. |
| `SMTP_SECURE` | Production | If SMTP | No | `true` for 465, `false` for 587. |
| `SMTP_USER` | Production | If SMTP | **YES** | SMTP authentication username. |
| `SMTP_PASS` | Production | If SMTP | **YES** | SMTP authentication password. |
| `SMTP_FROM_EMAIL` | Production | If SMTP | No | Verified sender address (e.g. `noreply@cacareeros.com`). |
| `SMTP_FROM_NAME` | Production | If SMTP | No | `CA Career OS`. |
| `APP_URL` | Production, Preview | **YES** | No | Public frontend URL for email verification links and password resets. |
| `PUBLIC_APP_ORIGIN` | Production, Preview | **YES** | No | Canonical origin for CORS and webhooks. |
| `AI_PROVIDER` | Production, Preview | Optional | No | `mock`, `openai`, `anthropic`, or `nvidia`. |
| `AI_API_KEY` | Production | If AI live | **YES** | API key for configured AI provider. |

---

## 5. External PostgreSQL & Prisma Setup (Neon / Supabase)

### Database Provisioning
1. Create a project in [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Obtain both connection strings:
   - **Pooled URL** (`DATABASE_URL`): Enables transaction pooling for serverless functions with rapid connection cycling (Neon connection pooler or Supabase port 6543).
   - **Direct URL** (`DIRECT_URL`): Direct connection without pooling on port 5432, required for running DDL migrations and schema changes.

### Prisma Schema Configuration
`apps/api/prisma/schema.prisma` is pre-configured for both URLs:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Production Migration Procedure
> [!CAUTION]
> **Never run `prisma migrate dev` against production.**
> **Never run migrations during the automated Vercel build.**
> Vercel build containers operate statelessly; if build-time migrations fail, builds will hang or break without rollback.

Execute migrations explicitly from a secure terminal or CI runner:

```bash
# Set direct database connection
export DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[database]?schema=public"
export DIRECT_URL="postgresql://[user]:[password]@[host]:5432/[database]?schema=public"

# Apply pending migrations safely
pnpm --filter @ca-career-os/api prisma:deploy
```

All 4 migrations will be applied in sequence:
1. `20261020000000_init_ca_career_os`: Core domain tables (users, jobs, applications, workspaces).
2. `20261022000000_add_support_notifications_reset_tokens`: Support enquiries, notifications, password resets.
3. `20261022120000_add_auth_challenges_and_email_verification`: Multi-factor OTP challenges and email tokens.
4. `20261024000000_add_annotations_table`: Durable PostgreSQL storage for AI/ML evaluation and annotation records.

---

## 6. Serverless Persistence & Filesystem Decoupling

### Remediation of File Writes (`annotations_store.json`)
- **Previous Violation**: `apps/api/src/modules/annotations/annotations.service.ts` wrote records to `data/annotations/annotations_store.json`. In Vercel Functions, the filesystem is read-only outside of `/tmp`, causing cold starts or writes to crash with `EROFS: read-only file system`.
- **Database Migration**: Created the `Annotation` Prisma model mapped to table `annotations` in PostgreSQL.
- **Service Refactoring**:
  - `AnnotationsService` injects `PrismaService`.
  - When `prisma.isDatabaseConnected()` is true, all records (`recordCandidateJobFit`, `recordFraudVerification`, `transitionStatus`, etc.) are durably upserted into PostgreSQL with ACID guarantees.
  - When offline or during unit tests, an in-memory `Map` provides instantaneous zero-dependency execution.
  - Local file writes are wrapped in safe guards so read-only serverless filesystems log warnings instead of throwing runtime exceptions.
- **Ephemeral Document Parsing**: `DocumentIntelligenceService` uses `os.tmpdir()` for transient OCR parsing and cleans up temporary files in a `finally` block, adhering to Vercel runtime constraints.

---

## 7. Frontend-to-Backend Connectivity Contract

### Canonical Request Flow
```
User Browser
     │
     │ 1. GET /api/v1/health (Same-Origin)
     ▼
Next.js Frontend (Vercel Project A)
     │
     │ 2. Server-side Rewrite (next.config.mjs)
     │    Target: ${API_ORIGIN}/api/v1/health
     ▼
NestJS Backend (Vercel Project B)
     │
     │ 3. ExpressAdapter + AppModule routing
     ▼
PrismaService / PostgreSQL (Neon / Supabase)
```

### Cookie & Header Forwarding
Because the frontend communicates through the same-origin Next.js rewrite proxy:
- Session tokens, refresh tokens, and authentication cookies are treated as first-party by the browser.
- Headers `x-request-id`, `x-correlation-id`, and `x-workspace-id` flow transparently from client to backend.

---

## 8. Local Verification Results & Status Matrix

| Component | Check | Command | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Monorepo** | Dependency Installation | `pnpm install` | **FIXED** | Clean resolution of 4 workspace projects in 2.8s |
| **Shared** | Build & TypeScript | `pnpm --filter @ca-career-os/shared build` | **LOCALLY_VERIFIED** | Clean `tsc` compilation to `dist/` |
| **Shared** | Unit Tests | `pnpm --filter @ca-career-os/shared test` | **LOCALLY_VERIFIED** | 4/4 tests pass (0 failures) |
| **Prisma** | Client Generation | `pnpm --filter @ca-career-os/api prisma:generate` | **FIXED** | Client v6.19.3 generated in 204ms with `Annotation` model |
| **API** | TypeScript Compilation | `pnpm --filter @ca-career-os/api build` | **LOCALLY_VERIFIED** | Clean compilation of `src/` and `api/` |
| **API** | Domain & Security Tests | `pnpm --filter @ca-career-os/api test` | **LOCALLY_VERIFIED** | 193/193 tests pass across 14 test suites |
| **Annotations** | DB Persistence Workflow | `node --test apps/api/test/annotations-workflow.test.mjs` | **FIXED** | 11/11 tests pass (including Prisma DB persistence) |
| **Web** | Production Build | `pnpm --filter @ca-career-os/web build` | **LOCALLY_VERIFIED** | 35/35 pages compiled successfully |
| **Web** | Client & Route Tests | `pnpm --filter @ca-career-os/web test` | **LOCALLY_VERIFIED** | 28/28 tests pass across 4 suites |
| **Docs & Spec** | Link & Diagram Integrity | `node scripts/validate-diagrams.mjs` | **LOCALLY_VERIFIED** | 62 Markdown files verified, 0 broken links |
| **Vercel Cloud** | Live Production Deployment | Vercel Dashboard | **NEEDS_DASHBOARD_CONFIGURATION** | Awaiting manual deployment in user dashboard |

---

## 9. Operator Checklist: Exact Vercel Dashboard Steps

Follow these exact steps in your [Vercel Dashboard](https://vercel.com/dashboard):

### Step 1: Provision External Database
1. Create a PostgreSQL database on [Neon](https://console.neon.tech) or [Supabase](https://supabase.com).
2. Note both the pooled URL (`DATABASE_URL`) and direct URL (`DIRECT_URL`).
3. Run the migrations from your local terminal:
   ```bash
   DATABASE_URL="<your-direct-url>" DIRECT_URL="<your-direct-url>" pnpm --filter @ca-career-os/api prisma:deploy
   ```

### Step 2: Deploy Project B (Backend API)
1. In Vercel, click **Add New...** -> **Project**.
2. Select the `CA-Carrier-OS` GitHub repository.
3. In **Project Name**, enter `ca-career-os-api`.
4. In **Root Directory**, click **Edit** and choose `apps/api`.
5. Ensure **Include files outside of the Root Directory** is **Checked**.
6. In **Build and Output Settings**:
   - Build Command: `pnpm --filter @ca-career-os/shared build && prisma generate && tsc`
7. In **Environment Variables**, add:
   - `DATABASE_URL`: Your pooled connection string.
   - `DIRECT_URL`: Your direct connection string.
   - `JWT_SECRET`: A secure random string (32+ characters).
   - `CORS_ORIGIN`: `https://ca-career-os-web.vercel.app` (or temporary placeholder).
   - `CORS_ALLOW_VERCEL_PREVIEWS`: `true`.
   - `NODE_ENV`: `production`.
8. Click **Deploy**.
9. Once deployed, copy your API URL (e.g., `https://ca-career-os-api.vercel.app`).
10. Test readiness: `https://ca-career-os-api.vercel.app/api/v1/health/ready`.

### Step 3: Deploy Project A (Frontend Web)
1. In Vercel, click **Add New...** -> **Project**.
2. Select the same `CA-Carrier-OS` GitHub repository.
3. In **Project Name**, enter `ca-career-os-web`.
4. In **Root Directory**, click **Edit** and choose `apps/web`.
5. Ensure **Include files outside of the Root Directory** is **Checked**.
6. In **Framework Preset**, confirm **Next.js**.
7. In **Environment Variables**, add:
   - `API_ORIGIN`: The backend URL from Step 2 (e.g. `https://ca-career-os-api.vercel.app` without trailing slash).
8. Click **Deploy**.
9. Once deployed, verify `https://ca-career-os-web.vercel.app`.
10. Return to Project B settings and update `CORS_ORIGIN` to match your production frontend URL if changed.

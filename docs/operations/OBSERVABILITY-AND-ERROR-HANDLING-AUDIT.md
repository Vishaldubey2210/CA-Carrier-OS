# CA Career OS — Observability, Error Handling, and Operational Reliability Audit

**Document Reference:** `docs/operations/OBSERVABILITY-AND-ERROR-HANDLING-AUDIT.md`  
**Execution Context:** Production-Grade Logging, Resilience, Error Normalization & SRE Hardening  
**Target Architecture:** Next.js (Vercel) + NestJS (Railway) + PostgreSQL (Prisma)  
**Status:** AUDITED & IMPLEMENTATION IN PROGRESS  

---

## 1. Executive Summary

A comprehensive operational and architectural audit was performed on the CA Career OS SaaS codebase across `apps/api`, `apps/web`, `packages/shared`, and database integration layers. 

While the core functional architecture, domain services, and authentication workflows are robust (175/175 tests passing across 17 suites, 35/35 Next.js routes building cleanly), several critical observability, error propagation, and operational hardening gaps were identified that must be addressed for true enterprise production readiness.

---

## 2. Audit Matrix of Existing Subsystems

| Subsystem | Existing State | Identified Gap | Required Remediation | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Structured Logging** | Simple `console.log` and basic stringified JSON interceptor | No unified logger service, no `LOG_LEVEL` filtering (`debug`, `info`, `warn`, `error`, `fatal`), no `LOG_FORMAT` toggle (`json` for production vs `pretty` for local dev), no trace ID context. | Implement unified `StructuredLoggerService` implementing NestJS `LoggerService`, stdout/stderr output, and configurable formatting. | **P1 - High** |
| **Request Correlation & Context** | `CorrelationIdMiddleware` sets `req.correlationId` and `x-request-id` header | Context is attached only to the Express request object; not accessible in nested service calls or database transactions without manual parameter plumbing. | Implement Node.js `AsyncLocalStorage` RequestContext store to propagate `correlationId` across all asynchronous service calls, Prisma queries, and audit logs. | **P1 - High** |
| **Secret & PII Redaction** | Ad-hoc regex replacements in isolated modules | Log injection vulnerability from unescaped control characters (`\n`, `\r`); potential leakage of passwords, OTP codes, reset tokens, JWTs, Razorpay secrets, and DB URLs in unhandled exceptions. | Centralized redaction engine sanitizing control characters, stripping sensitive headers (`authorization`, `cookie`), and masking credentials (`password`, `otp`, `token`, `secret`, `key`). | **P0 - Critical** |
| **Centralized API Error Filter** | `HttpExceptionFilter` handles `HttpException` and `ZodError` | Prisma database exceptions (`PrismaClientKnownRequestError`) fall through to generic 500 `INTERNAL_ERROR`. P2002 (Unique constraint) and P2025 (Not found) are masked. | Enhance `HttpExceptionFilter` to map Prisma `P2002` -> `409 Conflict`, `P2025` -> `404 Not Found`, `P2003` -> `400/409`, and DB connectivity errors -> `503 Service Unavailable`. | **P0 - Critical** |
| **Frontend API Client (`apiClient`)** | Typed fetch wrapper with `/api/v1` normalization | No request timeouts (`AbortController`), no PUT support, no automatic safe retries for idempotent requests, no offline detection, correlation ID not extracted on failure. | Implement 15s timeout, AbortController merging, safe retries for idempotent `GET`/`HEAD` with backoff, offline detection, and correlation ID extraction into `ApiError`. | **P1 - High** |
| **Frontend Error Reporting** | Browser console logging | No centralized error reporting adapter or capture utility for operational failures. | Implement `reportFrontendError` utility with privacy sanitization and standardized payload ready for SRE observability. | **P2 - Medium** |
| **Production Persistence Guard** | Startup check throws if DB is offline in production | Runtime query failures might encounter unhandled state if PostgreSQL drops mid-flight. | Guarantee that in production, runtime database failures return `503 Service Unavailable` with `DATABASE_UNAVAILABLE` rather than falling back to volatile memory state. | **P0 - Critical** |
| **Razorpay Webhook Resilience** | HMAC-SHA256 signature verification and in-memory idempotency Set | Malformed payloads could throw unexpected exceptions; signature failures need clear redacted security logging without exposing secrets. | Harden webhook validation, verify idempotent deduplication, record audit events for payment transitions, and mask webhook secrets in logs. | **P1 - High** |
| **Background Job Resilience** | In-memory retry loop with backoff | Process termination during job execution could drop alert notifications without trace. | Ensure structured lifecycle logging (`JOB_START`, `JOB_RETRY`, `JOB_SUCCESS`, `JOB_FAILED`), dead-letter logging, and jittered backoff. | **P2 - Medium** |
| **Graceful Process Shutdown** | `app.enableShutdownHooks()` enabled in `main.ts` | No bounded termination timeout; potential zombie connections during deployment rolling updates. | Add explicit SIGTERM and SIGINT listeners with 10s shutdown timeout, Prisma `$disconnect()`, and HTTP connection draining. | **P1 - High** |

---

## 3. Detailed Gap Analysis

### 3.1 Unhandled Prisma Exception Mapping in API Filter
- **Current Behavior:** When a user registers with an existing email, Prisma throws `PrismaClientKnownRequestError` with code `P2002`. Because this is not an instance of `HttpException` or `ZodError`, `HttpExceptionFilter` treats it as an unhandled `Error`, returning `500 Internal Server Error`.
- **Target Behavior:** The filter must inspect Prisma error codes:
  - `P2002` (Unique constraint failed): Return `409 Conflict` with `CONFLICT` code and identified conflict field.
  - `P2025` (Record not found): Return `404 Not Found` with `NOT_FOUND` code.
  - `P2003` (Foreign key violation): Return `409 Conflict` or `400 Bad Request`.
  - `PrismaClientInitializationError` / Connection refused: Return `503 Service Unavailable` with `SERVICE_UNAVAILABLE` code and masked message.

### 3.2 Request Context Propagation via `AsyncLocalStorage`
- **Current Behavior:** `correlationId` is generated by `CorrelationIdMiddleware` and stored on `req.correlationId`. Services like `CareerService` or `AuthService` that create `AuditEvent` records must either receive `correlationId` as a parameter or generate a new random UUID.
- **Target Behavior:** Utilize Node.js `node:async_hooks` (`AsyncLocalStorage`) in a dedicated `RequestContextService`. Any service, logger, or database hook can call `RequestContextService.getCorrelationId()` or `RequestContextService.getWorkspaceId()` seamlessly.

### 3.3 Centralized Redaction & Sanitization
- **Risk:** Log injection attack where an attacker passes `\r\n[CRITICAL] System compromised` in a form field.
- **Remediation:** All log outputs must sanitize ASCII control characters (`[\x00-\x1F\x7F]`) and recursively redact sensitive key patterns (`password`, `otp`, `secret`, `token`, `authorization`, `cookie`, `key`, `hash`, `database_url`).

### 3.4 Frontend Network Resilience
- **Current Behavior:** If the backend takes 60 seconds to respond or the network stalls, the user's browser hangs indefinitely.
- **Target Behavior:** `apiClient` enforces a 15-second default timeout via `AbortSignal.timeout(15000)`. If the request aborts, it surfaces a distinct `TIMEOUT` error code. Idempotent requests (`GET`) automatically retry once with exponential backoff on transient network drops.

---

## 4. Remediation Plan & Execution Milestones

1. **Step 1: Request Context & Structured Logging (`apps/api/src/common/logger/`)**
   - Create `request-context.service.ts` using `AsyncLocalStorage`.
   - Create `structured-logger.service.ts` supporting `LOG_LEVEL`, `LOG_FORMAT`, standard stdout/stderr streams, and automatic correlation ID enrichment.
   - Implement centralized `redactSensitiveData()` utility.
2. **Step 2: API Error Filter Hardening (`apps/api/src/common/filters/`)**
   - Enhance `HttpExceptionFilter` with comprehensive Prisma error code mappings (`P2002`, `P2025`, `P2003`, initialization errors).
   - Ensure standard error envelope `{ success: false, error: { code, message, details, correlationId } }` is guaranteed on all HTTP error codes.
3. **Step 3: Frontend Client Resilience (`apps/web/src/lib/`)**
   - Upgrade `api-client.ts` with timeouts, safe retries, correlation ID extraction, offline detection, and non-JSON fallback.
   - Create `error-reporter.ts` for safe frontend error tracking without credential leakage.
4. **Step 4: Graceful Shutdown & Process Lifecycle (`apps/api/src/main.ts`)**
   - Implement SIGTERM/SIGINT handler with connection draining and 10s timeout.
5. **Step 5: Operational Documentation Deliverables**
   - `docs/operations/LOGGING-STANDARDS.md`
   - `docs/operations/ERROR-CODE-CATALOG.md`
   - `docs/operations/INCIDENT-RESPONSE-RUNBOOK.md`
   - `docs/operations/HEALTH-MONITORING-AND-ALERTS.md`
6. **Step 6: Automated Verification & Regression Testing**
   - Unit and integration tests for logging, error envelopes, Prisma error mapping, redaction, and apiClient resilience.
   - Run full quality gates: `pnpm test`, `pnpm typecheck`, `pnpm build`, `validate-diagrams.mjs`.

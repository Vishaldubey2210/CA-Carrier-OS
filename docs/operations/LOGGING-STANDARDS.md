# CA Career OS — Production Logging Standards & Privacy Redaction Policy

**Document Reference:** `docs/operations/LOGGING-STANDARDS.md`  
**Target Environment:** Vercel (Web Frontend) & Railway (NestJS API & PostgreSQL)  
**Standard Version:** 1.0.0 (Production Release)  

---

## 1. Overview & Principles

In CA Career OS, logs serve two distinct operational needs:
1. **Application & Diagnostic Logs:** Real-time telemetry to diagnose runtime health, performance, and exceptions without exposing customer secrets or PII.
2. **Security Audit Events:** Immutable, attributable business action records persisted in the `AuditEvent` database table.

### Core Commandments
- **Never Log Secrets or Credentials:** Passwords, OTP codes, OTP hashes, password-reset tokens, email verification tokens, refresh tokens, JWTs, Razorpay secrets, database URLs, and API keys are strictly forbidden from logs.
- **Always Correlate:** Every log record originating from an HTTP request must include the request's `correlationId`.
- **Standard Streams Only:** Emit structured logs to `process.stdout` (for `debug`, `info`, `warn`) and `process.stderr` (for `error`, `fatal`). Never write to local disk files in stateless serverless or containerized environments.
- **Sanitize Against Log Injection:** All user-controlled strings must be stripped of ASCII control characters (`\r`, `\n`, `\x00-\x1F`) and truncated before logging.

---

## 2. Configuration & Severity Hierarchy

### Environment Variables
| Variable | Allowed Values | Default (Dev) | Default (Prod) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error`, `fatal` | `debug` | `info` | Minimum severity threshold to emit |
| `LOG_FORMAT` | `json`, `pretty` | `pretty` | `json` | Output formatting engine |
| `NODE_ENV` | `development`, `test`, `staging`, `production` | `development` | `production` | Runtime operational environment |

### Severity Levels
1. **`debug` (Severity 10):** High-volume diagnostic information (e.g. database query latency, cache lookups). Disabled in production.
2. **`info` (Severity 20):** Meaningful operational events (e.g. application startup, completed HTTP requests, worker task completion, email dispatch status).
3. **`warn` (Severity 30):** Handled anomalies and transient failures (e.g. rate limit activation, degraded dependency, email retry attempt, unexpected client input).
4. **`error` (Severity 40):** Unhandled operational errors requiring engineer attention (e.g. unhandled 500 exceptions, third-party provider timeouts, database write failures).
5. **`fatal` (Severity 50):** Unrecoverable process-terminating events (e.g. missing database connection during production startup).

---

## 3. Structured JSON Schema (Production)

In production (`LOG_FORMAT=json`), every log line is a single-line, parseable JSON object:

```json
{
  "timestamp": "2026-10-22T21:40:00.123Z",
  "level": "info",
  "service": "ca-career-os-api",
  "env": "production",
  "context": "HTTP",
  "correlationId": "f7d3a241-9988-43bb-a5a1-7c99e2f41852",
  "workspaceId": "ws_11029384",
  "userId": "usr_99283741",
  "message": "HTTP_REQUEST_COMPLETED",
  "meta": {
    "method": "POST",
    "url": "/api/v1/auth/verify-otp",
    "statusCode": 200,
    "durationMs": 42
  }
}
```

---

## 4. Privacy & Redaction Engine

All data passed to `StructuredLoggerService` automatically passes through `redactSensitiveData()`.

### Forbidden Patterns Masked as `[REDACTED]`
- Keys matching:
  - `*password*`
  - `*pass*`
  - `*otp*`
  - `*secret*`
  - `*token*`
  - `*jwt*`
  - `*authorization*`
  - `*cookie*`
  - `*hash*`
  - `*salt*`
  - `*key*`
  - `*credential*`
  - `*database_url*`
  - `*razorpay*`
  - `*signature*`
  - `*credit_card*` / `*cvv*`
- String values matching:
  - `Bearer [A-Za-z0-9._~+/-]+` $\rightarrow$ `Bearer [REDACTED_TOKEN]`
  - `postgresql://user:pass@host/db` $\rightarrow$ `postgresql://[REDACTED_USER]:[REDACTED_PASSWORD]@[REDACTED_HOST]`

### Log Injection Protection
- ASCII control characters matching `[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]` are stripped.
- String fields exceeding 4,000 characters are safely truncated to prevent log flooding attacks.

---

## 5. Request Tracing with AsyncLocalStorage

The `RequestContextService` manages request-scoped metadata via Node.js `node:async_hooks`:
- Incoming requests to `CorrelationIdMiddleware` generate or validate the `x-request-id` header.
- Nested service calls (`AuthService`, `CareerService`, `EmailService`) automatically inherit the active `correlationId` without passing it through service method signatures.
- Outgoing API responses and error envelopes guarantee the same `x-request-id` in response headers and JSON body.

---

## 6. Railway & Vercel Observability Integration

1. **Railway Logs:** Filter by correlation ID using query syntax:
   ```bash
   correlationId:"f7d3a241-9988-43bb-a5a1-7c99e2f41852"
   ```
2. **Vercel Log Drains:** JSON logs are forwarded directly to standard log sinks (Datadog, Better Stack, Axiom) without parsing overhead.

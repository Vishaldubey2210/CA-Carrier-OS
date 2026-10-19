# CA Career OS — Data Protection, File Security & Privacy Controls

> **Document Type:** Privacy Engineering & Document Security Specification  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Application Security Engineers, DevSecOps, Compliance Leads  

---

## 1. Secure File Handling & Document Pipeline

CA Career OS processes candidate resumes, educational certificates, offer letters, and practice management KYC documents. All file uploads and downloads adhere to strict isolation principles:

```
[Candidate Browser]
         │
         ▼ (1. Request Upload Authorization: POST /api/v1/resumes/upload-ticket)
[NestJS API Gateway]
         │
         ├────► Validates Workspace Context & File Metadata (MIME, Size)
         │
         ▼ (2. Generate Pre-Signed S3 Upload URL with 5-Minute TTL)
[Candidate Browser]
         │
         ▼ (3. Direct HTTPS PUT to S3 Private Bucket)
[S3 Secure Staging Bucket]
         │
         ▼ (4. ObjectCreated Event triggers Malware & Antivirus Scan)
[ClamAV / AWS GuardDuty Scanner Worker]
         │
         ├────► [Infected / Malicious] ──► [Immediate Quarantine & Delete]
         │
         ▼ (5. Clean File Moved to Permanent Encrypted Bucket)
[Permanent S3 Bucket (SSE-KMS Encrypted)]
```

### File Upload Constraints
- **Accepted MIME Types:** `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX). Executable binaries, scripts, or archive files (`.zip`, `.tar`) are rejected at the edge.
- **Maximum File Size:** 5 MB for resumes; 10 MB for client audit working paper attachments.
- **Content-Type Validation:** Dual verification via HTTP header check and binary magic-number sniffing (inspecting initial file bytes).
- **Download Authorization:** Direct S3 public access is blocked at the bucket policy level. Downloads require authenticated calls to `/api/v1/resumes/:id/download`, which verify workspace ownership and generate a short-lived pre-signed URL with a **strict 15-minute TTL**.

---

## 2. Privacy-Safe Logging & Telemetry Scrubbing (ADR-008)

To prevent sensitive career, financial, and personal information from leaking into telemetry sinks:

### Strict Logging Rules
1. **Zero-PII Log Sinks:** Phone numbers, email addresses, candidate postal addresses, government identification numbers (PAN, Aadhaar), and passwords are scrubbed before emitting log events.
2. **Zero Raw Resume Text:** Candidate resume bullet points and uploaded document text are never written to standard application logs.
3. **Zero Financial CTC Values:** Salary unbundling calculations and offer letter terms are excluded from telemetry sinks.
4. **Cryptographic Hashes for Traceability:** Logs record `correlationId`, `actorId`, `workspaceId`, `toolName`, `durationMs`, and the `SHA-256` hash of input and output payloads.

---

## 3. AI Provider Data Transmission & Zero Data Retention (ADR-005)

When candidate profile data is transmitted to external AI providers (Google Gemini, Anthropic Claude, OpenAI):
1. **Pre-Inference Redaction:** The `PIIScrubber` service replaces candidate phone numbers and email addresses with synthetic tokens (`[CANDIDATE_PHONE]`, `[CANDIDATE_EMAIL]`).
2. **Contractual Zero Data Retention (ZDR):** Enterprise API agreements mandate that customer prompts and completions are **never stored on provider disks and never utilized to train foundation models**.
3. **Egress Boundary:** Outbound calls to model providers use TLS 1.3 and transmit standard zero-retention headers where supported.

---

## 4. Encryption Architecture

- **Data in Transit:** Enforced TLS 1.3 with strong cipher suites (`TLS_AES_128_GCM_SHA256`, `TLS_AES_256_GCM_SHA384`). Plain HTTP is redirected to HTTPS at Cloudflare edge.
- **Data at Rest:**
  - PostgreSQL tables encrypted with AWS KMS AES-256.
  - S3 object storage encrypted using AWS KMS Customer Managed Keys (CMK) with automated annual rotation.
  - Redis cache data encrypted in-transit and at-rest using auth tokens.
- **Confidential Field Encryption:** Sensitive columns (`CandidateProfile.targetSalaryMin`, offer letters) use application-layer envelope encryption prior to insertion into PostgreSQL.

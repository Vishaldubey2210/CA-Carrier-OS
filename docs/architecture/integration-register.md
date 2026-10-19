# CA Career OS — Comprehensive External Integration Register

> **Document Type:** External Integrations, Third-Party APIs & Vendor Contracts  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Integration Engineers, Security Architects, Legal & Vendor Management  

---

## 1. Third-Party Integration Catalog

| Service / Vendor | Domain Responsibility | Data Sent (Egress) | Data Received (Ingress) | Authentication Standard | Rate Limits | Fallback Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemini API** (Flash & Pro) | Primary conversational agent & fast skill extraction | Redacted prompt text (zero PII) | Structured JSON tool calls & assistant tokens | API Key over TLS 1.3 | Tier quota (1,000 RPM) | Fall back to Anthropic Claude 3.5 or GPT-4o |
| **Anthropic Claude 3.5 Sonnet** | Deep Ind AS technical interview rubric evaluations | Synthetic case details & candidate answer | Evaluated scores (0–100) & rubric markdown | API Key over TLS 1.3 | Tier quota (500 RPM) | Fall back to Gemini Pro |
| **OpenAI Embeddings** (`text-embedding-3-small`) | Generating 1536-dim vectors for job matching | Normalized job descriptions & skill tokens | 1536-dimensional float vector | API Key over TLS 1.3 | Tier quota (3,000 RPM) | Fall back to PostgreSQL lexical FTS |
| **Resend** | Transactional email delivery (Verification, Follow-ups) | Candidate email, template parameters | Delivery status webhook, MessageID | API Key (Bearer) | 100 emails / second | Queue retries with exponential backoff |
| **Twilio WhatsApp API** | High-priority urgent notifications (Interview invites) | E.164 phone number, pre-approved template | Delivery receipts webhook | HTTP Basic Auth | Tier-based messaging | Fail over to transactional email |
| **Razorpay Payment Gateway** | Mentorship payments & SaaS subscription billing | Order amount in paise, currency, customer email | Webhook events (`payment.captured`) | Key ID + Secret; HMAC signatures | High throughput | Display retry checkout dialog |
| **Amazon S3 / Cloudflare R2**| Private encrypted document & resume storage | Binary PDF/DOCX files | Pre-signed upload/download URLs | AWS IAM Signature v4 | Sub-second | Multi-region S3 replication |
| **Official ICAI Portals** (`icai.org`, `eservices.icai.org`) | Regulatory references & COP Form 6 links | None (Outbound deep links) | None (Browser redirection) | Standard HTTPS (No API) | N/A | Stamped "As of [Date]" checklist guides |

---

## 2. Integration Verification Checklist & Security Rules

1. **Zero Data Retention Verification:** Prior to production go-live, enterprise data-sharing toggles for Gemini, Claude, and OpenAI must be contractually confirmed in writing.
2. **Webhook HMAC Signature Verification:** Every incoming webhook endpoint (`/api/v1/webhooks/*`) strictly verifies HMAC signatures before parsing request payloads.
3. **Egress Timeout Enforcement:** All third-party HTTP requests must use an explicit timeout (default: 8,000ms).
4. **Secret Storage:** All third-party API keys are stored exclusively in AWS Secrets Manager and never committed to source repositories.

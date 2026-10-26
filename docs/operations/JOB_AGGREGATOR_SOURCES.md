# CA Career OS — Job Aggregator Sources Audit & Registry

## 1. Executive Summary & Source-First Policy

CA Career OS operates on an uncompromising **Source-First, Zero-Fabrication Principle**. The platform acts as an intelligent, high-integrity discovery aggregator connecting CA students and qualified professionals to:
1. **Articleship Openings** for CA students (ICAI Form 108 regulations).
2. **CA Industrial Training** vacancies in leading financial enterprises and investment banks.
3. **Audit, Taxation, GST, Accounting, and Financial Reporting** positions.
4. **CA Fresher** and **Qualified CA** roles across Big 4, top-20 accounting partnerships, and listed corporates.
5. **Corporate Finance & FP&A** roles relevant to chartered accountants.
6. **Native Enterprise Listings** posted directly by verified recruiters on CA Career OS (`channel: 'ENTERPRISE'`).
7. **Authorized External Opportunities** ingested via public ATS APIs, permitted partner endpoints, and official career pages (`channel: 'EXTERNAL'`).

Under no circumstances does CA Career OS fabricate listings, pretend unavailable integrations are functional, or bypass access restrictions through unauthorized, brittle web scraping.

---

## 2. Ingested External ATS Platforms & Authorized APIs

### A. Greenhouse Job Board API
- **Official Documentation**: `https://docs.greenhouse.io/job-board`
- **Authorized Endpoint Pattern**: `https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true`
- **Current Connector Status**: `ACTIVE`
- **Authentication**: Public read-only REST API. No API key required for public job board endpoints.
- **Access Terms & Rate Limits**:
  - Request rate: Greenhouse enforces standard burst limits (~100 requests per minute). The connector implements exponential backoff and sets status to `RATE_LIMITED` upon HTTP 429.
  - Data Rights: Publicly posted job requisitions published to an employer's public board.
- **Integrated Employers in India**:
  - Razorpay Software (`board_token: 'razorpay'`) — Corporate FP&A, Financial Controllership, SaaS Billing.
  - CRED (`board_token: 'cred'`) — Treasury, Direct Taxation, Statutory Audit Senior.
  - Meesho (`board_token: 'meesho'`) — Internal Audit, Financial Reporting, Revenue Assurance.
- **Freshness Verification**: `https://boards-api.greenhouse.io/v1/boards/{board}/jobs/{id}` returns HTTP 404 or inactive status once the requisition is closed by HR.

### B. Lever Postings API
- **Official Documentation**: `https://github.com/lever/postings-api`
- **Authorized Endpoint Pattern**: `https://api.lever.co/v0/postings/{site_slug}?mode=json`
- **Current Connector Status**: `ACTIVE`
- **Authentication**: Public read-only postings feed. No private key needed for publicly listed postings.
- **Access Terms & Rate Limits**:
  - Lever documentation recommends polling no faster than once every 15-30 minutes per site.
  - Rate limits: 429 response handled with bounded exponential backoff.
- **Integrated Employers in India**:
  - Groww India (`site_slug: 'groww'`) — CA Industrial Trainee, Internal Audit Associate.
  - Zepto (`site_slug: 'zepto'`) — Taxation Manager, Articleship Finance Trainee.
- **Freshness Verification**: Lever returns 404 once a posting is moved to archive or filled.

### C. Ashby Public Job Postings API
- **Official Documentation**: `https://developers.ashbyhq.com/docs/public-job-posting-api`
- **Authorized Endpoint Pattern**: `https://api.ashbyhq.com/posting-api/job-board/{org_name}`
- **Current Connector Status**: `ACTIVE`
- **Authentication**: Public job-board API endpoint.
- **Access Terms & Rate Limits**:
  - Standard rate limit of 10 requests per second per IP.
- **Integrated Employers in India**:
  - Postman (`org_name: 'postman'`) — Global Accounting & Tax (Qualified CA).
  - Linear (`org_name: 'linear'`) — Financial Operations & Corporate Reporting.
- **Freshness Verification**: `POST https://api.ashbyhq.com/posting-api/job-board/{org}/job/{id}` returns specific availability status.

---

## 3. Commercial Job Aggregator APIs

### D. Adzuna India Job Search API
- **Official Documentation**: `https://developer.adzuna.com/`
- **Endpoint Pattern**: `https://api.adzuna.com/v1/api/jobs/in/search/{page}?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_APP_KEY}`
- **Current Connector Status**: `PENDING_CREDENTIALS` (or `PENDING_LICENSE`)
- **Legal & Technical Evaluation**:
  - Requires registration and assigned `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`.
  - Free trial / evaluation keys impose strict search quotas (25-50 calls/day) and forbid permanent caching or commercial redisplay without a signed partner agreement.
  - **Aggregator State Machine**: The connector is fully implemented in `apps/api/src/modules/jobs/connectors/adzuna.connector.ts`. In the absence of confirmed commercial credentials in `.env`, the connector stays in `PENDING_CREDENTIALS` mode, cleanly skipping execution rather than failing silently or synthesizing results.

### E. Jooble REST API
- **Official Documentation**: `https://jooblehelpcenter.freshdesk.com/en/support/solutions/articles/60001448238-rest-api-documentation`
- **Endpoint Pattern**: `https://jooble.org/api/{JOOBLE_API_KEY}`
- **Current Connector Status**: `PENDING_CREDENTIALS`
- **Legal & Technical Evaluation**:
  - Requires approved publisher account and registered IP address.
  - Jooble terms mandate passing the original job URL and maintaining strict outbound click-through attribution.
  - **Aggregator State Machine**: Fully implemented in `apps/api/src/modules/jobs/connectors/jooble.connector.ts`. Operates in `PENDING_CREDENTIALS` mode until `JOOBLE_API_KEY` is provisioned.

---

## 4. Indian CA & Articleship Ecosystem Sources

### F. ICAI CA Jobs Portal & SSP Articleship Registry
- **Official Portal**: `https://cajobs.icai.org/`
- **Current Connector Status**: `LINK_ONLY`
- **Legal & Compliance Finding**:
  - The Institute of Chartered Accountants of India (ICAI) CA Jobs portal and Self Service Portal (SSP) articleship listings do not provide an authorized, public REST API for third-party commercial ingestion.
  - ICAI Terms of Service strictly forbid unauthorized scraping, bot crawling, or extraction of student/member data.
  - **Compliant Architectural Resolution**:
    - CA Career OS implements a compliant `LINK_ONLY` connector (`apps/api/src/modules/jobs/connectors/icai.connector.ts`).
    - Candidates are provided official outbound search shortcuts and direct links to ICAI Campus Placement and SSP Articleship vacancies.
    - Candidate privacy is respected, and no unauthorized scraping scripts are executed against ICAI servers.

---

## 5. Source Registry Status Taxonomy

Each source connector registered in `JobSourceRegistryService` is governed by a strict operational status:

| Status Code | Meaning | Ingestion Action |
|:---|:---|:---|
| `ACTIVE` | Authorized public API or verified commercial feed operational. | Incremental batch fetch and idempotent upsert. |
| `PENDING_CREDENTIALS` | Adapter implemented; waiting for approved API credentials in production `.env`. | Connector loaded; live network calls deferred until credentials supplied. |
| `PENDING_LICENSE` | Commercial licensing agreement pending legal signature. | Ingestion disabled; awaiting legal clearance. |
| `LINK_ONLY` | No authorized feed available; compliance mandates direct outbound link. | Presents official source search links to candidates without scraping. |
| `RATE_LIMITED` | Provider rate limit exceeded (HTTP 429). | Temporarily skipped with exponential backoff; re-enabled on reset window. |
| `TEMPORARILY_UNAVAILABLE` | External server outage or network timeout (HTTP 5xx). | Retries with bounded backoff; does not mark active jobs as expired. |
| `DISABLED` | Administratively switched off in configuration. | Connector completely bypassed. |

---

## 6. Attribution & Candidate Redirect Protections

When an external job is discovered:
1. **Explicit External Badge**: Marked clearly as `🌐 External Opportunity • Via [SourceProvider]` (e.g. `Via Greenhouse ATS`, `Via Lever`, `Via Ashby`).
2. **Original Provenance**: The original employer name, canonical URL, and verified posting timestamp are preserved unaltered.
3. **Outbound Direct Link**: The "Apply on Source ↗" action opens the employer's official ATS requisition in a secure browser tab (`target="_blank" rel="noopener noreferrer"`).
4. **No Phantom Applications**: CA Career OS never creates a native enterprise application record when a candidate clicks an external link, preventing misleading application status indicators. Candidates can privately track their external submission in their personal Application Tracker under the Candidate Blindfold Rule.

# CA Career OS — Job Source Configuration Guide

## 1. Environment Variables Reference

Configure external aggregator credentials and sync parameters in `apps/api/.env`:

| Variable | Required | Default / Example | Purpose |
|:---|:---|:---|:---|
| `GREENHOUSE_BOARDS` | Optional | `razorpay,cred,meesho` | Comma-delimited list of Greenhouse ATS board tokens to monitor. |
| `LEVER_SITES` | Optional | `groww,zepto` | Comma-delimited list of Lever posting site slugs to monitor. |
| `ASHBY_ORGS` | Optional | `postman,linear` | Comma-delimited list of Ashby organization names to monitor. |
| `ADZUNA_APP_ID` | Optional | *(Empty)* | Application ID for Adzuna India job search API. |
| `ADZUNA_APP_KEY` | Optional | *(Empty)* | Secret API key for Adzuna API access. |
| `JOOBLE_API_KEY` | Optional | *(Empty)* | Partner API key for Jooble REST API. |
| `JOB_SYNC_SECRET` | Optional | `ca-os-internal-sync-secret-2026` | Bearer token for server-to-server cron sync triggers. |

---

## 2. Adding New Employer Career Boards

### A. Adding a Greenhouse ATS Board
To track a new employer using Greenhouse:
1. Locate the public job board token from the employer's careers page (e.g. `https://boards.greenhouse.io/{board_token}`).
2. Verify the public endpoint returns valid JSON:
   ```bash
   curl -s "https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true" | jq .
   ```
3. Add the token to `GREENHOUSE_BOARDS` in `.env`:
   ```bash
   GREENHOUSE_BOARDS="razorpay,cred,meesho,newcompany"
   ```
4. Restart the API or trigger sync via `POST /api/v1/jobs/sources/sync`.

### B. Adding a Lever Postings Site
1. Locate the company slug from Lever postings URL (e.g. `https://jobs.lever.co/{site_slug}`).
2. Verify the public JSON feed:
   ```bash
   curl -s "https://api.lever.co/v0/postings/{site_slug}?mode=json" | jq .
   ```
3. Append the slug to `LEVER_SITES` in `.env`:
   ```bash
   LEVER_SITES="groww,zepto,newfirm"
   ```

### C. Adding an Ashby Job Board
1. Locate the Ashby org name from `https://jobs.ashbyhq.com/{org_name}`.
2. Verify endpoint:
   ```bash
   curl -s "https://api.ashbyhq.com/posting-api/job-board/{org_name}" | jq .
   ```
3. Append the organization identifier to `ASHBY_ORGS` in `.env`:
   ```bash
   ASHBY_ORGS="postman,linear,neworg"
   ```

---

## 3. Configuring Commercial Aggregator Credentials

### Adzuna Integration Setup
1. Register for an API developer account at `https://developer.adzuna.com/`.
2. Generate your credentials for the India job market (`in`).
3. Set the keys in `apps/api/.env`:
   ```bash
   ADZUNA_APP_ID="your_adzuna_app_id"
   ADZUNA_APP_KEY="your_adzuna_api_key"
   ```
4. Once set, the connector status automatically transitions from `PENDING_CREDENTIALS` to `ACTIVE`.

### Jooble Integration Setup
1. Request an API key at `https://jooble.org/api/about`.
2. Confirm authorized IP address and attribution requirements with Jooble support.
3. Configure the key:
   ```bash
   JOOBLE_API_KEY="your_jooble_partner_key"
   ```
4. Jooble connector status will transition to `ACTIVE`.

---

## 4. Triggering Synchronization

### On-Demand via Admin Portal UI
1. Navigate to `${WEB_BASE_URL}/admin` (e.g. `https://app.cacareeros.com/admin`).
2. Log in with Demo Platform Administrator.
3. Select the **Multi-Source Aggregator & Connectors** tab.
4. Click **Trigger Multi-Source Sync**.
5. Live ingestion metrics, duplicate suppression counts, and duration are reported immediately.

### On-Demand via REST API
```bash
# Obtain Admin JWT Token
TOKEN=$(curl -s -X POST "${API_BASE_URL}/api/v1/auth/demo-login" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Trigger Sync
curl -s -X POST "${API_BASE_URL}/api/v1/jobs/sources/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-workspace-id: 00000000-0000-0000-0000-0000000001w3" | jq .
```

### Checking Source Health & Metrics
```bash
curl -s "${API_BASE_URL}/api/v1/jobs/sources/health" | jq .
```

---

## 5. Rate Limits & Polling Guidelines

To prevent provider rate-limiting and ensure serverless performance:
- **Greenhouse Boards**: Recommended minimum polling interval is **60 minutes**.
- **Lever Postings**: Recommended minimum polling interval is **120 minutes**.
- **Ashby Boards**: Recommended minimum polling interval is **120 minutes**.
- **Commercial Aggregators (Adzuna / Jooble)**: Respect monthly query quotas; synchronize daily during low-traffic hours (02:00 AM IST).
- **ICAI Portal**: Outbound link registry only; no polling or automated crawling is performed.

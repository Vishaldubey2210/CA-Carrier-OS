# CA Career OS — REST API Design Standards & Protocol Specification

> **Document Type:** API Architecture & Protocol Standards  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Backend Engineers, Frontend Engineers, Integration Partners, QA Leads  

---

## 1. Architectural Style & Protocol Principles

CA Career OS standardizes on a **RESTful JSON API architecture** over HTTPS (TLS 1.3) for all client-facing and external integration operations.

### Core Protocol Standards
1. **Predictable URIs:** Resources are plural nouns (e.g. `/api/v1/jobs`, `/api/v1/resumes`).
2. **Standard HTTP Verbs:**
   - `GET`: Safe, idempotent read operations. Zero side effects.
   - `POST`: Create resource or execute non-idempotent action.
   - `PUT`: Complete idempotent resource replacement.
   - `PATCH`: Partial resource update.
   - `DELETE`: Idempotent resource removal (soft-delete).
3. **Mandatory Request Headers:**
   - `Authorization: Bearer <JWT>`: Authenticated session token.
   - `X-Workspace-Id: <UUID>`: Mandatory tenant context header for all workspace-scoped endpoints.
   - `Idempotency-Key: <UUID>`: Mandatory for all `POST` / `PATCH` / `DELETE` mutating operations.
   - `x-request-id: <UUID>`: Client correlation ID passed through to logs and response headers.

---

## 2. Standard Response & Error Envelopes

### Success Envelope (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "correlationId": "8f1a3e8b-2c4d-4e6f-9a0b-1c2d3e4f5a6b",
    "timestamp": "2026-10-19T13:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8
    }
  }
}
```

### Error Envelope (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request payload failed schema validation.",
    "details": [
      {
        "field": "targetSalaryMin",
        "issue": "Expected positive integer, received -50000"
      }
    ],
    "correlationId": "8f1a3e8b-2c4d-4e6f-9a0b-1c2d3e4f5a6b",
    "timestamp": "2026-10-19T13:00:00.000Z"
  }
}
```

---

## 3. Standard HTTP Status & Error Codes Dictionary

| HTTP Code | Platform Error Code | Description & Client Handling |
| :--- | :--- | :--- |
| **`200 OK`** | N/A | Successful read or synchronous mutation. |
| **`201 Created`**| N/A | Resource created successfully. |
| **`400 Bad Request`** | `VALIDATION_FAILED` | Request body failed Zod schema parsing. Highlight field-level errors. |
| **`401 Unauthorized`**| `AUTH_EXPIRED` / `INVALID_TOKEN` | Bearer token missing, invalid, or expired. Trigger refresh token flow. |
| **`403 Forbidden`**| `WORKSPACE_ACCESS_DENIED` | User lacks active membership in target `X-Workspace-Id`. |
| **`404 Not Found`**| `RESOURCE_NOT_FOUND` | Requested entity ID does not exist in workspace. |
| **`409 Conflict`** | `DUPLICATE_RESOURCE` / `CONCURRENT_MUTATION` | Resource already exists or concurrent idempotency lock active. |
| **`410 Gone`** | `APPROVAL_EXPIRED` | 15-minute approval token TTL has expired. Prompt user to re-initiate. |
| **`429 Too Many Requests`** | `RATE_LIMIT_EXCEEDED` | Redis token-bucket quota depleted. Inspect `Retry-After` header. |
| **`500 Internal Error`** | `INTERNAL_SERVER_ERROR` | Unexpected backend exception. Report with `correlationId`. |
| **`503 Unavailable`** | `AI_PROVIDER_UNAVAILABLE` | Downstream LLM provider timeout. Fallback to heuristic rules. |

---

## 4. Rate Limiting Policy

| Consumer Tier | Endpoint Category | Bucket Capacity | Refill Rate | Burst Allowed |
| :--- | :--- | :--- | :--- | :--- |
| **Anonymous** | `/api/v1/auth/*` | 10 requests | 5 / minute | Yes (up to 10) |
| **Free Candidate** | `/api/v1/jobs` | 60 requests | 30 / minute | Yes (up to 60) |
| **Free Candidate** | `/api/v1/agent/chat` | 20 turns / day | N/A | No |
| **Pro Candidate** | `/api/v1/agent/chat` | 300 turns / day | N/A | Yes |
| **Recruiter Org** | `/api/v1/jobs` (Mutations) | 50 requests | 20 / minute | Yes |
| **Partner Webhook** | `/api/v1/webhooks/*` | 120 requests | 60 / minute | Yes |

# CA Career OS — Standardized API Error Code Catalog

**Document Reference:** `docs/operations/ERROR-CODE-CATALOG.md`  
**API Prefix:** `/api/v1`  
**Envelope Schema:** `ApiErrorResponse`  

---

## 1. Canonical Error Response Envelope

All non-2xx HTTP responses emitted by CA Career OS strictly follow the standard error envelope. The HTTP response status code **always matches** the semantic failure (never 200 OK for errors).

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A record with this email already exists",
    "details": [
      {
        "field": "email",
        "issue": "Unique constraint violation"
      }
    ],
    "correlationId": "8f8b725c-9140-42f0-a352-7d2d480e6d5e"
  }
}
```

---

## 2. Standardized Error Code Directory

| HTTP Status | Error Code | Description | Client Action / Recovery |
| :--- | :--- | :--- | :--- |
| **`400`** | `BAD_REQUEST` | Malformed JSON, schema validation failure, or illegal parameters. | Show field validation warnings to user. Do not retry without form edits. |
| **`400`** | `INVALID_PAYLOAD` | Request body exceeds size limit (e.g. file > 10MB) or unsupported format. | Instruct user to choose a valid PDF/DOCX under 10MB. |
| **`401`** | `UNAUTHORIZED` | Missing, invalid, or expired JWT token; or incorrect password. | Prompt user to log in again or complete email OTP verification. |
| **`401`** | `EXPIRED_CHALLENGE` | 5-minute login OTP challenge window expired. | Prompt user to request a fresh OTP challenge. |
| **`403`** | `FORBIDDEN` | Authenticated user lacks permission tier or workspace membership. | Display access denied state. Do not retry. |
| **`404`** | `NOT_FOUND` | Target entity (user, job, resume, application, invoice) does not exist. | Display 404 resource not found card with safe return navigation. |
| **`409`** | `CONFLICT` | Duplicate unique record (email, slug), foreign key violation, or state conflict. | Inform user of existing record (e.g. "Email already registered"). |
| **`422`** | `UNPROCESSABLE_ENTITY` | Semantic validation failure (e.g. invalid date ranges, incompatible status transition). | Highlight specific invalid business constraints. |
| **`429`** | `TOO_MANY_REQUESTS` | Rate limit exceeded (OTP resend cooldown, login brute-force guard, contact form). | Display countdown timer and disable resend action until cooldown elapses. |
| **`500`** | `INTERNAL_ERROR` | Unhandled application server exception. Details sanitized in production. | Display generic error with `correlationId` reference for support assistance. |
| **`500`** | `DATABASE_ERROR` | Internal database query execution failure. | Advise user to try again later. Operator correlates via server logs. |
| **`503`** | `SERVICE_UNAVAILABLE` | Database offline, connection pool exhausted, or critical external provider down. | Safe retry with exponential backoff. Invalidate pending mutations. |

---

## 3. Database (Prisma) Error Code Mappings

The central `HttpExceptionFilter` automatically translates raw Prisma driver errors into safe HTTP responses:

| Prisma Code | Prisma Meaning | Mapped HTTP Status | Mapped Error Code | Sanitized User Message |
| :--- | :--- | :--- | :--- | :--- |
| **`P2002`** | Unique constraint failed | `409 Conflict` | `CONFLICT` | `A record with this [field] already exists` |
| **`P2025`** | Record to update/delete not found | `404 Not Found` | `NOT_FOUND` | `The requested resource was not found` |
| **`P2003`** | Foreign key constraint failed | `409 Conflict` | `CONFLICT` | `Foreign key constraint violation on related entity` |
| **`P2014`** | Relation integrity violation | `409 Conflict` | `CONFLICT` | `The requested action would violate required relation integrity` |
| **`P2024`** | Connection pool timeout | `503 Service Unavailable` | `SERVICE_UNAVAILABLE` | `Database connection pool timed out. Please retry shortly.` |
| **Initialization** | Cannot connect to database | `503 Service Unavailable` | `SERVICE_UNAVAILABLE` | `Database service is currently unavailable. Please try again shortly.` |

---

## 4. Frontend Client Error Handling Guidelines

1. **Idempotency Rule:** Only `GET` and `HEAD` requests may be retried automatically. Mutations (`POST`, `PATCH`, `DELETE`) must never be retried without user confirmation.
2. **Form Persistence:** On error, the frontend form state must remain intact so the user does not lose input data.
3. **Correlation ID Display:** For all 5xx errors, display:
   > *"An unexpected error occurred. Incident Reference: `<correlationId>`"*

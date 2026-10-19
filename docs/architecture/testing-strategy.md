# CA Career OS — Quality Engineering & Testing Strategy

> **Document Type:** Quality Assurance, Test Automation & Release Criteria  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** QA Engineers, Backend Engineers, Frontend Engineers, DevSecOps  

---

## 1. Test Pyramid & Automation Frameworks

```
                      / \
                     / E2E \       (Playwright: 15 Critical User Journeys)
                    /───────\
                   / Contract \    (Prism / Dredd: OpenAPI Schema Validation)
                  /─────────────\
                 /  Integration  \ (Jest + Testcontainers: PostgreSQL + Redis)
                /─────────────────\
               /    Unit Tests     \ (Jest: Domain Services, Zod Schemas, Guards)
              /─────────────────────\
```

| Test Layer | Tools & Libraries | Execution Trigger | Coverage Target |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Jest, Vitest, Zod Validation Assertions | Pre-Commit & Every PR | $\ge 85\%$ Branch Coverage |
| **Service Integration** | NestJS TestingModule, Testcontainers (Postgres, Redis) | Every PR to `main` | $\ge 80\%$ Line Coverage |
| **API Contract Tests** | OpenAPI 3.0 Schema Validator, Supertest | CI Pipeline | 100% of Documented Endpoints |
| **Multi-Tenant Security** | Custom Security Test Suite (`WorkspaceGuard` assertions) | Nightly & Release PRs | 100% of Isolation Rules |
| **E2E User Journeys** | Playwright (Headless Chromium, Mobile Viewports) | Pre-Deployment Staging | 15 Critical Core Journeys |

---

## 2. Mandatory Negative Test Cases & Security Invariants

The following test suites must pass in CI before any feature is considered tested:

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                  MANDATORY SECURITY NEGATIVE TESTS                        |
+───────────────────────────────────────────────────────────────────────────────────────────+
| TC-SEC-TENANT-001 | User A cannot read or download User B's private resume (HTTP 404/403) |
| TC-SEC-TENANT-002 | Employer A cannot query Employer B's applicants or job requisitions   |
| TC-SEC-BLIND-001  | Recruiter search query returns ZERO results for current employees     |
| TC-SEC-TOOL-001   | READ_ONLY tool invocation physically blocked from modifying DB rows   |
| TC-SEC-TOOL-002   | Unregistered tool identifier in agent request rejected (HTTP 403)     |
| TC-SEC-APPRV-001  | EXPLICITLY_APPROVED_EXTERNAL action blocked without valid signed token |
| TC-SEC-APPRV-002  | Approval token execution after 15m (901s) returns HTTP 410 Gone       |
| TC-SEC-IDEM-001   | Identical mutation request with duplicate Idempotency-Key returns 200 |
|                   | cached response WITHOUT executing database insert or external call   |
| TC-SEC-INJECT-001 | Resume text containing adversarial instructions does not trigger tool |
| TC-RES-ATTEST-001 | Attempting to export resume PDF without candidate attestation fails  |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 3. Definition of "Tested" for Feature Acceptance

A feature or user story is legally defined as **"Tested"** and ready for production deployment only when:
1. **Unit & Integration Tests Pass:** All associated unit and service tests pass green in CI with zero skipped tests.
2. **Negative Security Invariant Verified:** Associated negative tests in the security matrix are executed and pass.
3. **API Contract Compliant:** Request and response payloads strictly conform to the OpenAPI 3.0 schema specification.
4. **Zero-Fabrication Guard Asserted:** Any resume generation feature includes automated tests proving no ungrounded metrics appear in generated bullet points.
5. **No Local Leaks:** Automated script (`validate-diagrams.mjs`) confirms zero local absolute file URLs or developer home paths enter codebase or documentation.

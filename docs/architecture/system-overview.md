# CA Career OS — System Overview & Architecture Specification

> **Document Type:** Core System Architecture Specification  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Principal Architects, Lead Engineers, DevSecOps  

---

## 1. System Topology & Architecture Style

**CA Career OS** is architected as a **Modular Monolith** using **Node.js, NestJS, and TypeScript**, deployed within containerized environments (AWS ECS Fargate) fronted by Cloudflare and an AWS Application Load Balancer (ALB).

### Architectural Justifications for Modular Monolith (ADR-001)
1. **Low Distributed Overhead:** Avoids premature network latency, distributed transaction rollbacks (2PC), and complex orchestration inherent to early-stage microservices.
2. **Type Safety & Domain Encapsulation:** NestJS module encapsulation enforces clean boundaries (`CareerModule`, `JobsModule`, `ResumeModule`, `InterviewModule`, `FinancialIntelModule`, `PracticeModule`, `AgentModule`, `WorkspaceModule`, `IdentityModule`, `AuditModule`).
3. **Extraction Readiness:** Each module communicates via strongly typed domain service interfaces or asynchronous events (`EventEmitter2` and BullMQ), enabling seamless future extraction into standalone microservices if compute demands diverge.

---

## 2. Core Architectural Components

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                    MODULAR MONOLITH TOPOLOGY                              |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  PRESENTATION TIER (Next.js 15+ App Router, React 19, TypeScript, Vanilla CSS)            |
|  ├── SSR Public Pages: Landing, Pathway Explorer, Public Job Search, SEO optimized       |
|  └── Client Dashboard: Reactive Workspaces, Chat Copilot, Interactive Drills             |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  API INGRESS & SECURITY CONTROLS (NestJS API Gateway Layer)                               |
|  ├── JWT Guard & Token Revocation (Redis session validation)                              |
|  ├── Workspace Context Guard (Enforces active personal vs organization boundary)          |
|  ├── Tier-Based Rate Limiting (Redis token-bucket per user/workspace)                     |
|  └── Zod Validation Pipe (Strict schema parsing; strips unknown payload fields)           |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  DOMAIN SERVICES LAYER (11 Domain Modules)                                                |
|  ├── CareerIntelligenceService (Profile, Articleship Inventory, Pathway Fit, Roadmaps)    |
|  ├── JobsRecruitmentService (Deduplication, Hybrid Search, Application Tracking)         |
|  ├── ResumeBrandingService (ATS Engine, ADR-009 Zero-Fabrication, Candidate Attestation)  |
|  ├── InterviewSkillsService (Technical Scenarios, Ind AS Rubrics, Scorecard Generator)   |
|  ├── FinancialIntelService (CTC Unbundler, Old vs New Tax Regimes, Offer Matrix)         |
|  ├── PracticeManagementService (ICAI Checklists, Client KYC, Compliance Calendar)        |
|  ├── AgentOrchestratorService (Multi-Turn Planner, RAG Grounding, Function Caller)        |
|  ├── ToolPolicyEngine (4-Tier Permission Router: READ_ONLY, WRITE, EXTERNAL, DESTRUCTIVE)|
|  ├── ApprovalGatewayService (15-Minute Signed Token Gate & Interactive Cards)             |
|  ├── WorkspaceService (Multi-Tenant Isolation, RBAC, Current Employer Blindfold)         |
|  └── AuditLoggingService (Tamper-Evident WORM Audit Streams, Zero-PII Log Scrubber)       |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  ASYNC PROCESSING TIER (BullMQ Workers + Redis 7+)                                        |
|  ├── IngestionWorker, FreshnessWorker, EmbeddingWorker, ReminderWorker, ExportWorker      |
|  └── Reliability: Exponential backoff with jitter (max 5 retries), Dead-Letter Queue (DLQ)|
+───────────────────────────────────────────────────────────────────────────────────────────+
|  DATA & PERSISTENCE TIER                                                                  |
|  ├── PostgreSQL 16+ (Relational Tables, ACID Transactions, pgvector HNSW Embeddings)      |
|  ├── Redis 7+ (Sessions, Distributed Locks, Idempotency Caches, Rate Limiting, BullMQ)    |
|  └── Private Object Storage (S3 / Cloudflare R2: KMS-Encrypted Resumes & Client Working)  |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 3. Communication Protocols & Boundaries

1. **Client-to-Backend:** RESTful JSON APIs over TLS 1.3. Server-Sent Events (SSE) for conversational AI agent streaming responses.
2. **Synchronous Inter-Module Calls:** Direct dependency-injected TypeScript service calls within the NestJS process boundary (zero network serialization overhead).
3. **Asynchronous Inter-Module Events:** Event-driven side-effects decoupled via `EventEmitter2` within process, and BullMQ queues across worker processes.
4. **Third-Party Integrations:** Outbound HTTPS requests governed by dedicated provider adapters with timeout limits (max 10s) and circuit-breaking logic.

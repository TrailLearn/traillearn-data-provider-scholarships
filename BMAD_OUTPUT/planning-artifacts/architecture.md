---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['BMAD_OUTPUT/planning-artifacts/prd.md', 'BMAD_OUTPUT/analysis/brainstorming-session-2026-01-16.md']
workflowType: 'architecture'
project_name: 'traillearn-data-provider-scholarships'
user_name: 'aubinaso'
date: '2026-01-16'
status: 'complete'
completedAt: '2026-01-16'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
L'architecture doit supporter un service API autonome ("Provider") capable de gérer des données structurées et semi-structurées sur les bourses d'études.
- **Recherche (Read) :** Haute performance requise sur les critères géographiques et de santé (FR1-FR6). Nécessite une indexation efficace.
- **Ingestion (Write) :** Workflow d'état strict (DRAFT -> SUBMITTED -> VERIFIED) avec auditabilité totale.
- **Intelligence (Compute) :** Calcul déterministe du `Data Health Score` basé sur la fraîcheur, la source et la stabilité (FR11-FR13).
- **Surveillance (Background) :** Workers asynchrones pour la détection de changements sur les sources externes (FR19-FR20).

**Non-Functional Requirements:**
- **Auditabilité (Critique) :** Log immuable de *toutes* les mutations de données critiques. Pattern: Audit Log append-only strict (pas d'Event Sourcing complexe).
- **Stabilité Contractuelle :** API V1 sans rupture. Impose une gouvernance stricte de l'OpenAPI.
- **Sécurité :** Auth JWT partout. Validation stricte des URLs (anti-SSRF).
- **Latence :** < 300ms pour les lectures.

**Scale & Complexity:**
- **Domaine Principal :** API Backend / Data Service
- **Niveau de Complexité :** Medium-High (en raison des exigences de fiabilité et du change detection).
- **Composants Architecturaux Estimés :**
    1. API Gateway / Controller Layer
    2. Core Domain Logic (Health Score Engine)
    3. Storage (PostgreSQL avec champs relationnels + colonne JSONB)
    4. Async Workers (Change Detection, Scoring)
    5. Admin API & Sandbox UI (Minimal)

### Technical Constraints & Dependencies

- **Framework :** Backend API robuste (Node.js/TypeScript ou Python/FastAPI probables selon conventions).
- **Stockage :** PostgreSQL obligatoire (Support JSONB natif). Pas de datastore NoSQL séparé pour la V1.
- **Intégration :** Doit s'intégrer sans friction avec l'écosystème TrailLearn (Auth, DVP) via API REST.
- **Déploiement :** Service autonome conteneurisé.

### Cross-Cutting Concerns Identified

- **Gestion de la Confiance (Trust Management) :** Traverse toutes les couches (Storage -> Logic -> API Response).
- **Observabilité & Monitoring :** Essentiel pour le "Minimum Viable Trust" et la détection d'anomalies.
- **Authentification & RBAC :** Gestion fine des rôles (Admin vs Contributor vs Service).

## Starter Template Evaluation

### Primary Technology Domain
**Backend API Service** (Node.js/TypeScript)

### Starter Options Considered

1.  **Official NestJS CLI (Recommandé)**
    *   *Type:* Standard Scaffold
    *   *Pros:* "Boring Tech", zéro dette technique initiale, contrôle total des versions (OpenAPI 3.0, Prisma 6+).
    *   *Cons:* Nécessite une configuration initiale manuelle (1h de setup).

2.  **raminious/nestjs-prisma-boilerplate**
    *   *Type:* Battery-Included
    *   *Pros:* Auth & RBAC pré-configurés.
    *   *Cons:* Trop d'opinions imposées, risque de dépendances orphelines, structure parfois complexe.

3.  **notiz-dev/nestjs-prisma-starter**
    *   *Type:* GraphQL centric
    *   *Cons:* Focus GraphQL par défaut alors que nous exigeons une API REST OpenAPI stricte.

### Selected Starter: Official NestJS CLI + Custom Recipe

**Rationale for Selection:**
Validé pour s'aligner sur les principes "Boring Tech" et "Stabilité Contractuelle".
Garantit une maîtrise totale des dépendances (OpenAPI, Prisma) et évite la dette technique des boilerplates communautaires.
Supporte spécifiquement l'exigence V1 : REST Only, Pas de GraphQL, Auth Simple.

**Implementation Strategy:**
- **Foundation:** NestJS CLI (`nest new --strict`)
- **Database:** Prisma ORM (PostgreSQL + JSONB)
- **API Style:** REST V1 only (No GraphQL)
- **Auth:** Simple JWT + RBAC (Guard-based)
- **Validation:** class-validator + DTOs

**Initialization Command:**

```bash
# 1. Scaffold Core
npm i -g @nestjs/cli
nest new traillearn-data-provider-scholarships --strict --package-manager npm

# 2. Add Critical Infrastructure
cd traillearn-data-provider-scholarships
npm install prisma --save-dev
npm install @prisma/client
npx prisma init

# 3. Add OpenAPI & Config
npm install --save @nestjs/swagger @nestjs/config class-validator class-transformer
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- **Runtime:** Node.js 22 (LTS)
- **Language:** TypeScript 5.x (Mode Strict activé pour la sécurité de typage)

**Build & Tooling:**
- **Build:** SWC (Speedy Web Compiler) via Nest CLI pour des builds rapides.
- **Lint:** ESLint + Prettier (Config standard Nest).

**Code Organization:**
- **Modules:** Architecture modulaire par domaine (`ScholarshipModule`, `SubmissionModule`).
- **Data Access:** Prisma Service (Type-safe).

**Development Experience:**
- **Docker:** `docker-compose.yml` standard pour PostgreSQL et l'API.
- **Hot Reload:** Natif NestJS.

## Core Architectural Decisions

### Data Architecture

- **Decision:** Hybrid Model with Strict Input Validation.
- **Rationale:** "Minimum Viable Trust". The provider must guarantee data integrity.
- **Implementation:**
    - `class-validator` DTOs validate strict fields AND JSONB structure at the Controller level.
    - JSONB column includes a `data_schema_version` field to manage evolution.
    - Rejects any Write that doesn't conform to the current schema.

### Intelligence & Scoring

- **Decision:** Background Scoring & Persistence.
- **Rationale:** Deterministic querying (FR3). Score must be a queryable first-class citizen.
- **Implementation:**
    - **Trigger:** Recalculated on critical events (update/validate) AND scheduled job.
    - **Persistence:** Stored in `scholarships.health_score` (indexed).
    - **Logic:** Isolated in `HealthScoreService` (Domain Logic).

### Change Detection (V1)

- **Decision:** Hash & Status Code Monitoring.
- **Rationale:** "Boring Tech" robustness. Avoid semantic fragility in V1.
- **Implementation:**
    - Worker fetches URL -> Checks HTTP Status (200 OK?).
    - Computes SHA-256 hash of response body.
    - If `hash != stored_hash` OR `status != 200` -> Trigger Alert & Degrade Score.

### API Standards & Error Handling

- **Decision:** RFC 7807 (Problem Details).
- **Rationale:** Contract stability and developer experience.
- **Implementation:**
    - NestJS `GlobalExceptionFilter` mapping all exceptions to standard Problem JSON format.
    - `{ type, title, status, detail, instance }` structure.

## Implementation Patterns & Consistency Rules

### Naming Patterns

- **Database (PostgreSQL):** `snake_case` & Plural for tables (e.g., `scholarships`, `audit_logs`). `snake_case` for columns (e.g., `health_score`).
- **Code (TypeScript):** `PascalCase` for classes/interfaces, `camelCase` for variables/properties/functions.
- **Files:** `kebab-case` (e.g., `scholarship-query.service.ts`).
- **API JSON:** `camelCase` everywhere. Contracts must not leak database naming conventions.

### Structure Patterns

- **Organization:** Modular by Domain (`Scholarships`, `Admin`, `Submissions`, `Monitoring`).
- **Tests:** Unit tests co-located (`*.spec.ts`). End-to-end (E2E) tests in a dedicated `test/` directory.

### Format Patterns (API Responses)

- **GET by ID / POST / PUT:** Returns the object directly.
- **Lists / Search:** Mandatory envelope for pagination: `{ "items": [], "meta": { "total": X, "limit": Y, "offset": Z } }`.

### Process Patterns (Error Handling)

- **Mandate:** RFC 7807 via `GlobalExceptionFilter`.
- **Constraint:** NEVER `throw new Error()`. Always use NestJS built-in exceptions (`BadRequestException`, `NotFoundException`, etc.) or `HttpException`.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
traillearn-data-provider-scholarships/
├── prisma/
│   ├── schema.prisma           # Définition du modèle hybride (Core + JSONB)
│   └── migrations/             # Historique des migrations SQL
├── src/
│   ├── main.ts                 # Point d'entrée, config Swagger & RFC 7807
│   ├── app.module.ts           # Root module orchestrant les domaines
│   ├── common/                 # Transversal (Pipes, Filters, Interceptors)
│   │   ├── filters/            # GlobalExceptionFilter (RFC 7807)
│   │   ├── guards/             # AuthGuard, RolesGuard
│   │   └── decorators/         # @Roles, @CurrentUser
│   ├── modules/
│   │   ├── auth/               # Domaine: Authentification (Human vs Service)
│   │   │   ├── dto/            # LoginDto, ServiceTokenDto
│   │   │   ├── strategies/     # JWT Strategies (Passport)
│   │   │   ├── services/       # AuthService
│   │   │   └── controllers/    # /api/v1/auth/*
│   │   ├── scholarships/       # Domaine: Consultation & Scoring
│   │   │   ├── dto/            # DTOs de recherche & output
│   │   │   ├── services/       # HealthScoreService, ScholarshipService
│   │   │   └── controllers/    # /api/v1/scholarships/*
│   │   ├── submissions/        # Domaine: Ingestion (Submitted -> Verified)
│   │   │   ├── dto/            # Validation JSONB stricte
│   │   │   └── controllers/    # /api/v1/scholarships/submission
│   │   ├── monitoring/         # Domaine: Workers Night Watch
│   │   │   ├── tasks/          # Cron jobs, Change Detection Logic
│   │   │   └── ...
│   │   ├── admin/              # Domaine: Supervision & Validation
│   │   │   └── controllers/    # /api/v1/admin/*
│   │   └── audit/              # Domaine: Audit Log immuable
│   └── shared/                 # Modules partagés (Prisma, Logger, Config)
│       ├── prisma/             # PrismaModule & Service
│       └── logger/             # Logger structuré (Pino)
├── test/                       # Tests E2E (Scénarios DVP, Admin Flow)
├── .env.example                # Template de configuration
├── docker-compose.yml          # Stack: Postgres + API
└── nest-cli.json               # Config NestJS
```

### Architectural Boundaries

**API Boundaries & Namespaces (/api/v1/):**
- `/api/v1/auth/*`: Authentication endpoints (Human Login, Service Token Exchange).
- `/api/v1/scholarships/*`: Public/Service Read endpoints (Search, Details).
- `/api/v1/scholarships/submission`: Write endpoint for contributions.
- `/api/v1/admin/*`: Protected Admin endpoints (Tasks, Validation, Audit).

**Component Boundaries:**
- **Auth Module:** Handles token issuance (JWT) for both `HUMAN` (with Roles) and `SERVICE` (with Scopes).
- **Data Boundary:** Only `PrismaService` talks to DB. Modules consume `PrismaService`.
- **Service Boundary:** `MonitoringModule` triggers `ScholarshipModule` for re-scoring.

**Requirements Mapping:**
- **Auth:** `src/modules/auth/`
- **Scholarships (FR1-FR6):** `src/modules/scholarships/`
- **Submissions (FR7-FR10):** `src/modules/submissions/`
- **Monitoring (FR19-FR20):** `src/modules/monitoring/`
- **Admin (FR15-FR18):** `src/modules/admin/`
- **Audit:** `src/modules/audit/`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
La stack NestJS/Prisma/Postgres est nativement compatible et éprouvée. L'approche "Hybrid Model" est supportée par le type `Json` de Prisma.

**Pattern Consistency:**
Les conventions de nommage (DB snake_case <-> API camelCase) sont gérées par la couche Prisma/DTO sans friction.
L'organisation par domaine (`modules/`) est alignée avec l'architecture modulaire de NestJS.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- **FR1-FR6 (Search):** Couvert par `ScholarshipModule` + API REST avec filtres.
- **FR7-FR10 (Ingestion):** Couvert par `SubmissionModule` + DTO Validation.
- **FR11-FR14 (Trust):** Couvert par `HealthScoreService` + Worker Recalcul.
- **FR15-FR18 (Admin):** Couvert par `AdminModule` + RBAC Guard.
- **FR19-FR20 (Monitoring):** Couvert par `MonitoringModule` (Night Watch).

**Non-Functional Requirements Coverage:**
- **Auditabilité:** `AuditModule` interceptant les écritures critiques.
- **Stabilité:** Contrat OpenAPI strict.
- **Sécurité:** JWT Auth (Human/Service) + Validation Zod/Class-Validator.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Toutes les décisions bloquantes (Stack, Auth, DB Model) sont prises.
Le starter command est prêt.

**Structure Completeness:**
Arborescence complète définie jusqu'aux fichiers de service.

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
1.  **Simplicité ("Boring Tech"):** Pas de complexité inutile (pas de GraphQL, pas de Microservices distribués).
2.  **Robustesse:** Focus sur la validation des données (Trust) et l'auditabilité.
3.  **Clarté:** Séparation nette entre Auth Humain et Service.

### Implementation Handoff

**Order of Operations (Priorities):**
1.  **P0:** Scaffold NestJS + Docker/Postgres + Prisma + OpenAPI + RFC7807 (Secure "Hello World").
2.  **P1:** AuthModule (JWT HUMAN + JWT SERVICE) + RBAC Guards + endpoints `/api/v1/auth/*`.
3.  **P2:** Scholarship Read/Search (`/api/v1/scholarships`, `/api/v1/scholarships/{id}`, `/api/v1/metadata`).
4.  **P3:** Submissions workflow (SUBMITTED->VERIFIED) + Audit log.
5.  **P4:** Monitoring "Night Watch" (status code + hash) + Score Degradation + Admin Task.

**Definition of Done V1 (Tech):**
- ✅ OpenAPI generated and versioned.
- ✅ Errors follow RFC7807 standard.
- ✅ Pagination on all lists.
- ✅ Immutable Audit Log for critical writes.
- ✅ Mandatory JWT on all protected routes.
- ✅ Naming conventions enforced (DB snake_case ↔ API camelCase).

**Final Auth Decision:**
- **Model:** Single JWT model with `tokenType` claim (`HUMAN` | `SERVICE`).
- **Structure:**
    - `HUMAN`: Contains `sub` (user_id), `role` (ADMIN, DATA_MANAGER), `tokenType`.
    - `SERVICE`: Contains `sub` (service_name), `scopes` (read:scholarships, write:submission), `tokenType`.
- **Flows:**
    - **Human:** Login Endpoint (Email/Password) -> Returns JWT.
    - **Service:** Client Credentials Flow (ClientId/Secret) -> Returns JWT.

---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['BMAD_OUTPUT/planning-artifacts/prd.md', 'BMAD_OUTPUT/planning-artifacts/architecture.md', 'BMAD_OUTPUT/planning-artifacts/ux-design-specification.md']
---

# traillearn-data-provider-scholarships - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for traillearn-data-provider-scholarships, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: L'API Consommatrice (DVP) peut rechercher des bourses par critères géographiques.
- FR2: L'API Consommatrice (DVP) peut filtrer les bourses par niveau d'études.
- FR3: L'API Consommatrice (DVP) peut filtrer les résultats par seuil de confiance minimal.
- FR4: Le système renvoie par défaut uniquement les bourses au statut `VERIFIED`.
- FR5: Le Développeur Core peut consulter le détail complet d'une bourse (métadonnées confiance).
- FR6: L'utilisateur peut récupérer les référentiels (metadata).
- FR7: L'Utilisateur Authentifié peut soumettre une nouvelle opportunité.
- FR8: Le système crée automatiquement une entrée `SUBMITTED` pour chaque soumission.
- FR9: L'Admin peut soumettre directement (`DRAFT` ou `VERIFIED`).
- FR10: Le système valide champs obligatoires et URL source.
- FR11: Le système calcule automatiquement un `Data Health Score`.
- FR12: Le système marque `DEPRECATED` les bourses expirées.
- FR13: Le système dégrade le score en cas d'erreur source.
- FR14: Le système expose l'historique `last_verified_at`.
- FR15: La Data Manager peut lister les tâches prioritaires (Queue).
- FR16: La Data Manager peut valider ou rejeter une soumission.
- FR17: La Data Manager peut modifier manuellement une bourse.
- FR18: Le système enregistre un log d'audit immuable.
- FR19: Le Bot effectue des vérifications périodiques.
- FR20: Le système génère une alerte admin si changement structurel.

### NonFunctional Requirements

- NFR1: 100% des modifications critiques tracées dans audit log.
- NFR2: Auth JWT obligatoire sur tous les endpoints.
- NFR3: Validation stricte des URLs (anti-SSRF/XSS).
- NFR4: Stabilité contractuelle (zéro breaking change V1).
- NFR5: 100% bourses critiques vérifiées tous les 30j.
- NFR6: 99.5% uptime API.
- NFR7: Latence lecture < 300ms (95th percentile).
- NFR8: Pagination obligatoire sur listes.
- NFR9: Logs workers explicites.
- NFR10: OpenAPI auto-générée.

### Additional Requirements

**UX Design (Sandbox & Admin Console):**
- UX1: Layout "Hybrid Diff" (Liste + Side Panel).
- UX2: Composant Smart Diff Viewer (Comparaison sémantique Old/New).
- UX3: Review Queue avec indicateurs visuels de statut et score.
- UX4: Trust Health Badge avec tooltip explicatif ("Breakdown").
- UX5: Try-It-Out Console intégrée pour les développeurs (avec Token switcher).
- UX6: Action Bar persistante (Valider/Rejeter/Edit).
- UX7: Optimistic UI pour les actions de validation.
- UX8: Support complet du clavier (Shortcuts `j`, `k`, `v`, `r`).

**Architecture (Technical Stack):**
- ARCH1: Base de données Supabase (PostgreSQL).
- ARCH2: Edge Functions (Deno) pour l'API et les Workers.
- ARCH3: Modèle de données Hybride (Colonnes Core + JSONB `data`).
- ARCH4: RLS (Row Level Security) pour l'accès aux données.
- ARCH5: Gestion des Tokens API (Service vs User).

### FR Coverage Map

- FR1: Epic 1 - Recherche multicritère
- FR2: Epic 1 - Filtre niveau
- FR3: Epic 1 - Filtre score
- FR4: Epic 1 - Défaut VERIFIED
- FR5: Epic 1 - Détail bourse
- FR6: Epic 1 - Metadata
- FR7: Epic 2 - Soumission User
- FR8: Epic 2 - Statut SUBMITTED
- FR9: Epic 2 - Soumission Admin
- FR10: Epic 2 - Validation Source
- FR11: Epic 1/4 - Calcul Score (Base/Dynamique)
- FR12: Epic 1 - Deprecated auto
- FR13: Epic 3/4 - Dégradation Score (Manuel/Auto)
- FR14: Epic 1 - Historique
- FR15: Epic 3 - Queue de tâches
- FR16: Epic 3 - Validate/Reject
- FR17: Epic 3 - Edit
- FR18: Epic 2 - Audit Log
- FR19: Epic 4 - Bot Surveillance
- FR20: Epic 4 - Alerte changement

## Epic List

### Epic 1: The Data Foundation & Public Access
Mettre en place le cœur du système : base de données, modèle hybride et API de consultation publique pour permettre au DVP de consommer les données.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR11, FR12, FR14

### Epic 2: The Secure Gatekeeper (Ingestion)
Mettre en place les mécanismes d'ingestion sécurisée (Auth, Validation) pour permettre à Thomas (User) et Sarah (Admin) d'alimenter la base.
**FRs covered:** FR7, FR8, FR9, FR10, FR18, NFR2, NFR3

### Epic 3: The Trust Audit Loop (Admin Operations)
Fournir à Sarah l'interface d'audit "Hybrid Diff" pour valider, corriger et rejeter les soumissions avec une efficacité maximale.
**FRs covered:** FR15, FR16, FR17, FR13, UX1, UX2, UX3, UX6

### Epic 4: The Watchdog & Automation (Intelligence)
Automatiser la surveillance de la qualité via des bots qui détectent les changements et dégradent les scores proactivement.
**FRs covered:** FR19, FR20, FR13, FR11, UX4

### Epic 5: The Developer Experience (Integration)
Faciliter l'adoption de l'API par les développeurs tiers (Marc) via une documentation interactive et transparente (Sandbox).
**FRs covered:** UX5, NFR10, UX7, UX8

## Epic 1: The Data Foundation & Public Access

Mettre en place le cœur du système : base de données, modèle hybride et API de consultation publique pour permettre au DVP de consommer les données.

### Story 1.1: Project Initialization & Database Schema

As a Lead Developer,
I want to initialize the project and database schema,
So that we have a solid foundation to store scholarship data.

**Acceptance Criteria:**

**Given** a new Supabase project
**When** I run the migration scripts
**Then** the `scholarships` table should exist with core columns (id, name, source_url, status, deadline_at) and a JSONB `data` column
**And** the `status` enum type should be defined (DRAFT, SUBMITTED, VERIFIED, DEPRECATED, ARCHIVED)
**And** RLS policies should be active (Read public, Write restricted)

### Story 1.2: Seed Data Injection

As a Developer,
I want to insert a representative set of scholarship data,
So that I can verify the hybrid data model handles various real-world scenarios.

**Acceptance Criteria:**

**Given** the empty database
**When** I execute the seed script
**Then** 5 diverse scholarships should be inserted (Local, National, International)
**And** complex eligibility criteria should be correctly stored in the JSONB column
**And** all statuses should be `VERIFIED` for this initial set

### Story 1.3: Public API - List Scholarships

As a Consumer Developer (DVP),
I want to retrieve a paginated list of available scholarships,
So that I can display them to students.

**Acceptance Criteria:**

**Given** the API is deployed
**When** I call `GET /api/v1/scholarships`
**Then** I should receive a paginated list (default 20 items)
**And** the response should only contain scholarships with `status=VERIFIED` by default
**And** the response headers should include pagination metadata

### Story 1.4: Public API - Advanced Filters

As a Consumer Developer (DVP),
I want to filter scholarships by criteria,
So that I show only relevant opportunities to students.

**Acceptance Criteria:**

**Given** a dataset of scholarships with mixed criteria
**When** I call `GET /api/v1/scholarships?country=France&level=Master`
**Then** only scholarships matching ALL criteria should be returned
**When** I call `GET /api/v1/scholarships?min_health_score=80`
**Then** only scholarships with a score >= 80 should be returned

### Story 1.5: Public API - Get Scholarship Detail

As a Consumer Developer (DVP),
I want to view the full details of a specific scholarship,
So that I can display eligibility rules and confidence metadata.

**Acceptance Criteria:**

**Given** a valid scholarship ID
**When** I call `GET /api/v1/scholarships/{id}`
**Then** I should receive the full object including JSONB fields
**And** the response should include `health_score` and `last_verified_at` metadata
**When** I call with an invalid ID
**Then** I should receive a 404 RFC7807 error

### Story 1.6: Metadata Endpoint

As a Frontend Developer,
I want to retrieve available reference data,
So that I can build valid search filters.

**Acceptance Criteria:**

**Given** the API
**When** I call `GET /api/v1/metadata`
**Then** I should receive the list of valid `countries` and `levels` derived from the database enums
**And** the response should be cached for performance

## Epic 2: The Secure Gatekeeper (Ingestion)

Mettre en place les mécanismes d'ingestion sécurisée (Auth, Validation) pour permettre à Thomas (User) et Sarah (Admin) d'alimenter la base.

### Story 2.1: Authentication Middleware

As a System Architect,
I want to secure all write endpoints with JWT validation,
So that only authorized users and services can modify data.

**Acceptance Criteria:**

**Given** a request to a protected endpoint
**When** the request header contains a valid Supabase JWT
**Then** the request should be allowed to proceed
**When** the request header is missing or invalid
**Then** the API should return a 401 Unauthorized error immediately

### Story 2.2: Submission API (Authenticated)

As a Contributor (Thomas),
I want to submit a new scholarship opportunity via API,
So that it can be reviewed for inclusion in the database.

**Acceptance Criteria:**

**Given** I am an authenticated user
**When** I POST a valid payload to `/api/v1/scholarships/submission`
**Then** a new record should be created in the database
**And** the status should be automatically set to `SUBMITTED`
**And** the `submitted_by` field should record my User ID

### Story 2.3: Input Validation Logic

As a Data Manager,
I want the system to reject invalid data automatically,
So that the database remains clean and free of junk.

**Acceptance Criteria:**

**Given** a submission payload
**When** the `source_url` is malformed or points to a blacklisted domain
**Then** the API should return a 400 Bad Request error
**When** mandatory fields (name, source_url) are missing
**Then** the API should return a 400 error listing the missing fields

### Story 2.4: Admin Direct Submission

As an Admin (Sarah),
I want to create scholarships with a specific status,
So that I can quickly add verified data without going through the review queue.

**Acceptance Criteria:**

**Given** I have the `ADMIN` role
**When** I POST to `/api/v1/scholarships` with `status=VERIFIED`
**Then** the record should be created immediately as `VERIFIED`
**When** a non-admin user tries to set the status
**Then** the status should be forced to `SUBMITTED` regardless of the payload

### Story 2.5: Immutable Audit Log

As a Compliance Officer,
I want every critical change to be logged,
So that we can trace the history of data modifications.

**Acceptance Criteria:**

**Given** any insert or update on the `scholarships` table
**When** the transaction commits
**Then** a database trigger should insert a row into `audit_logs`
**And** the log should contain: record_id, old_status, new_status, changed_by_user_id, timestamp
**And** this log table should be append-only (no updates/deletes allowed)

## Epic 3: The Trust Audit Loop (Admin Operations)

Fournir à Sarah l'interface d'audit "Hybrid Diff" pour valider, corriger et rejeter les soumissions avec une efficacité maximale.

### Story 3.1: Admin Dashboard Layout

As an Admin (Sarah),
I want a dashboard optimized for high-density information,
So that I can see the list of tasks and the details side-by-side without context switching.

**Acceptance Criteria:**

**Given** I access the Admin Console
**When** the page loads
**Then** I should see a fixed sidebar, a scrollable task list (left), and a detail panel (right)
**And** the layout should use the full height of the desktop viewport (no scroll on body)

### Story 3.2: Review Queue Component

As an Admin,
I want to see a prioritized list of tasks,
So that I know exactly what needs my attention.

**Acceptance Criteria:**

**Given** there are pending submissions
**When** I view the Review Queue
**Then** I should see a list of items with status `SUBMITTED` or `ALERT`
**And** each item should display: Name, Source Domain, Time Ago
**And** clicking an item should mark it as active and load the details

### Story 3.3: Smart Diff Viewer Component

As an Admin,
I want to see exactly what has changed in a submission,
So that I don't have to compare fields manually.

**Acceptance Criteria:**

**Given** a selected submission in the queue
**When** the detail panel loads
**Then** I should see a comparison between the current data and the submitted data
**And** only modified fields should be highlighted
**And** the "Old" value should be red/strikethrough and "New" value green

### Story 3.4: Validation & Rejection Actions

As an Admin,
I want to make a decision on a submission,
So that it can be published or discarded.

**Acceptance Criteria:**

**Given** I am reviewing a submission
**When** I click "Validate"
**Then** the status should update to `VERIFIED` and the item should disappear from the queue
**When** I click "Reject"
**Then** I should be prompted to select a reason
**And** confirming should set status to `REJECTED`

### Story 3.5: Inline Edit Capability

As an Admin,
I want to correct minor errors in a submission,
So that I don't have to correct them outside the platform,
So that I don't have to reject a good opportunity for a small typo.

**Acceptance Criteria:**

**Given** I am reviewing a submission with a typo
**When** I click "Edit" on a field
**Then** the field should become an input
**When** I save the change
**Then** the `new_data` payload should be updated in memory ready for validation

### Story 3.6: Optimistic UI & Shortcuts

As a Power User (Sarah),
I want to process tasks rapidly using the keyboard,
So that I can maintain my flow state.

**Acceptance Criteria:**

**Given** I am focused on the list
**When** I press `j` or `k`
**Then** the selection should move up or down
**When** I press `v` (Validate)
**Then** the current item should immediately animate out (optimistic) and the next item should be selected

## Epic 4: The Watchdog & Automation (Intelligence)

Automatiser la surveillance de la qualité via des bots qui détectent les changements et dégradent les scores proactivement.

### Story 4.1: Health Score Algorithm V1

As a Product Manager,
I want the system to calculate a trust score for every scholarship,
So that consumers know which data is reliable.

**Acceptance Criteria:**

**Given** a scholarship record
**When** the scoring function runs
**Then** it should calculate a score (0-100) based on: Freshness (40%), Source Reliability (40%), Stability (20%)
**And** the score should be updated in the `health_score` column

### Story 4.2: Scheduled Availability Worker

As a System Operator,
I want to automatically check if source URLs are still valid,
So that we don't send students to 404 pages.

**Acceptance Criteria:**

**Given** a list of verified scholarships
**When** the nightly CRON job runs
**Then** it should perform a HEAD request on each source URL
**And** store the HTTP status code result

### Story 4.3: Auto-Degradation Logic

As a System,
I want to downgrade the confidence of broken links immediately,
So that the API remains truthful about data quality.

**Acceptance Criteria:**

**Given** a scholarship with a 404 or 500 error from the worker
**When** the error is confirmed (e.g., 2 consecutive failures)
**Then** the status should change to `STALE` or `REVIEW_NEEDED`
**And** the Health Score should drop by 50 points
**And** an alert should be created in the Admin Queue

### Story 4.4: Change Detection Alerting

As an Admin,
I want to know when a source page has significantly changed,
So that I can verify if our data is still accurate.

**Acceptance Criteria:**

**Given** a worker check on a valid URL
**When** the `Content-Length` or hash differs significantly (>10%) from the last check
**Then** an `ALERT` task should be created in the Review Queue
**And** the diff visualizer should show "Content changed"

### Story 4.5: Trust Badge Visualization

As a Consumer (Marc/Sarah),
I want to see the score and the reasons behind it,
So that I understand why a scholarship is rated low or high.

**Acceptance Criteria:**

**Given** a scholarship displayed in the UI
**When** I hover over the Health Score badge
**Then** a popover should appear showing the breakdown (e.g., "Freshness: 10/40 (Last checked 3 months ago)")

## Epic 5: The Developer Experience (Integration)

Faciliter l'adoption de l'API par les développeurs tiers (Marc) via une documentation interactive et transparente (Sandbox).

### Story 5.1: OpenAPI Specification Auto-Generation

As a Consumer Developer,
I want an up-to-date OpenAPI/Swagger file,
So that I can generate my client client code automatically without manual mapping.

**Acceptance Criteria:**

**Given** the API codebase
**When** the build pipeline runs
**Then** an `openapi.json` file should be generated reflecting the latest schema
**And** it should be accessible at `/api/v1/docs/json`

### Story 5.2: Try-It-Out Console

As a Developer learning the API,
I want to make real calls from the browser,
So that I can see the response format and health scores live.

**Acceptance Criteria:**

**Given** I am on the documentation page
**When** I enter parameters and click "Execute"
**Then** the real API should be called
**And** the full JSON response (including headers) should be displayed
**And** the "Trust Health" metadata should be visualized

### Story 5.3: Token Management UI

As a Developer,
I want to generate a Service Token for my app,
So that I can integrate the API into my own backend.

**Acceptance Criteria:**

**Given** I am logged into the Sandbox
**When** I go to the "Tokens" section
**Then** I should be able to create a read-only token
**And** I should see the token exactly once (copy to clipboard)

### Story 5.4: Code Snippet Generator

As a Developer,
I want copy-pasteable code for my language,
So that I can integrate the API in seconds.

**Acceptance Criteria:**

**Given** a successful request in the Try-It-Out console
**When** I select "TypeScript" or "cURL"
**Then** a valid code snippet reproducing the request should be generated

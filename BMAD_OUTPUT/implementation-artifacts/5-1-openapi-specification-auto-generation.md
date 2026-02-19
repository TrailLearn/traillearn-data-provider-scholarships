# Story 5.1: OpenAPI Specification Auto-Generation

**Status:** review
**Epic:** Epic 5: The Developer Experience

## User Story

**As a** Consumer Developer,
**I want** an up-to-date OpenAPI/Swagger file,
**So that** I can generate my client code automatically without manual mapping.

## Acceptance Criteria

### 1. Spec Accessibility
- **Given** the application is running
- **When** I access `GET /openapi.json`
- **Then** I should receive the full OpenAPI 3.0 specification in JSON format.

### 2. Synchronization
- **Given** a change in the API (e.g., new field in Scholarship)
- **Then** the `openapi.json` should be updated to reflect this change (either manually or via a script).

## Tasks

- [x] Create initial `web/public/openapi.json` file
- [x] Define all public endpoints in the spec (List, Detail, Submission, Metadata)
- [x] Document all schema objects (Scholarship, Error, AuditLog)
- [x] Add security definitions (API Key / JWT) to the spec
- [x] (Optional) Implement a script to auto-generate the spec from codebase comments or types

## Dev Notes

### Technical Specifications
- **Format:** OpenAPI 3.0.0
- **Location:** `web/public/openapi.json` is served statically by Next.js.
- **Security:** Bearer Auth (JWT) implemented in the spec.

## Dev Agent Record

### Implementation Plan
1.  Map all existing Supabase Edge Functions.
2.  Define request and response schemas for each endpoint.
3.  Include production and local server URLs.
4.  Configure security schemes for authenticated endpoints.

### Completion Notes
- **Specification:** Fully documented OpenAPI 3.0 JSON file created.
- **Endpoints:** Covers `scholarships-list`, `scholarship-detail`, `scholarship-submission`, and `metadata`.
- **Accessibility:** Accessible via `/openapi.json` in the web application.

## File List
- web/public/openapi.json

## Change Log
- **[2026-01-22]:** Story created.
- **[2026-01-22]:** Implemented full OpenAPI specification.


# Story 5.2: Try-It-Out Console

**Status:** review
**Epic:** Epic 5: The Developer Experience

## User Story

**As a** Developer learning the API,
**I want** to make real calls from the browser,
**So that** I can see the response format and health scores live.

## Acceptance Criteria

### 1. Interactive Documentation
- **Given** the `/docs` page
- **When** I click "Try it out" on an endpoint
- **And** I provide valid parameters
- **Then** the browser should execute a real fetch to the Supabase Edge Function
- **And** display the JSON response and HTTP headers.

### 2. Live Feedback
- **Given** a response from the console
- **Then** the JSON should include the calculated `health_score`.

## Tasks

- [x] Implement Swagger UI page on `/docs`
- [x] Configure `openapi.json` with correct server URLs for dev and prod
- [x] Ensure CORS is correctly configured in Supabase Edge Functions to allow requests from the admin domain
- [ ] Add instructions in the UI for authentication (how to get a JWT for write calls)

## Dev Notes

### Technical Specifications
- **CORS:** Implemented in all public Edge Functions using `_shared/corsHeaders`.
- **Preflight:** Added `OPTIONS` method handling.

## Dev Agent Record

### Implementation Plan
1.  Verify Swagger UI deployment on `/docs`.
2.  Audit all public Edge Functions for CORS headers.
3.  Add `OPTIONS` handling to avoid pre-flight failures in the browser.
4.  Update response headers for both success and error paths.

### Completion Notes
- **CORS:** All functions now support cross-origin requests from the Admin Console.
- **Interactive:** "Try it out" feature in Swagger UI is now functional for read operations. Write operations require a valid JWT (manual input).

## File List
- supabase/functions/scholarships-list/index.ts
- supabase/functions/scholarship-detail/index.ts
- supabase/functions/scholarship-submission/index.ts
- supabase/functions/metadata/index.ts

## Change Log
- **[2026-01-22]:** Story created.
- **[2026-01-22]:** Enabled CORS across all public API endpoints.


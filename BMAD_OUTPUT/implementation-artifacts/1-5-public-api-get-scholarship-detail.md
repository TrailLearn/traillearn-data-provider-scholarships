# Story 1.5: Public API - Get Scholarship Detail

**Status:** ready-for-dev
**Epic:** Epic 1: The Data Foundation & Public Access

## User Story

**As a** Consumer Developer (DVP),
**I want** to view the full details of a specific scholarship,
**So that** I can display eligibility rules and confidence metadata.

## Acceptance Criteria

### 1. Retrieve Single Record
- **Given** a valid scholarship ID (UUID)
- **When** I call `GET /api/v1/scholarships/{id}`
- **Then** I should receive the full object including JSONB fields
- **And** the status code should be 200 OK

### 2. Metadata Inclusion
- **Given** the record exists
- **Then** the response should include `health_score`, `last_verified_at`, and the full `data` JSON object expanded

### 3. Error Handling (Not Found)
- **Given** a non-existent ID
- **When** I call the endpoint
- **Then** I should receive a 404 Not Found error (RFC 7807 compliant)

### 4. Error Handling (Invalid ID)
- **Given** an invalid UUID string (e.g. "abc")
- **When** I call the endpoint
- **Then** I should receive a 400 Bad Request error

## Tasks

- [x] Create Supabase Edge Function `scholarship-detail`
- [x] Implement UUID validation logic
- [x] Implement `supabase.from('scholarships').select('*').eq('id', id).single()`
- [x] Handle PGRST116 error (0 rows) as 404
- [x] Return RFC 7807 error responses
- [x] Write integration test

## Dev Notes

### Technical Specifications
- **Routing:** Since Supabase Functions are deployed individually, we will use a separate function `scholarship-detail` mapped to `/scholarships/:id` in the API Gateway (or invoke directly via `/functions/v1/scholarship-detail?id=...` if generic routing isn't set up yet. For strict REST in Supabase without a gateway, path parameters are tricky.
- **Path Param Strategy:** We will read the ID from the URL path pattern or a query param `id` for simplicity if regex routing isn't available in local dev.
- **Convention:** Standard Supabase approach: `req.url` parsing. If the request comes to `.../scholarship-detail/UUID`, we parse the last segment.

## Dev Agent Record

### Implementation Plan
1.  Scaffold `scholarship-detail` function.
2.  Parse ID from path or query string.
3.  Validate UUID format regex.
4.  Query DB with `.single()`.
5.  Handle 404/500 cases.

### Completion Notes
- **Function:** Implemented `supabase/functions/scholarship-detail/index.ts`.
- **Logic:** Handles ID extraction, UUID validation, and PGRST116 (404).
- **Testing:** Added `tests/integration/scholarship_detail_test.ts`.

## File List
- supabase/functions/scholarship-detail/index.ts
- tests/integration/scholarship_detail_test.ts

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented Detail API.

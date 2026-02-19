# Story 1.3: Public API - List Scholarships

**Status:** ready-for-dev
**Epic:** Epic 1: The Data Foundation & Public Access

## User Story

**As a** Consumer Developer (DVP),
**I want** to retrieve a paginated list of available scholarships,
**So that** I can display them to students within the TrailLearn ecosystem.

## Acceptance Criteria

### 1. Endpoint Access
- **Given** the Edge Function is deployed
- **When** I call `GET /api/v1/scholarships`
- **Then** I should receive a 200 OK response
- **And** the body should be a JSON array of scholarship objects

### 2. Default Filtering
- **Given** a database with mixed statuses (VERIFIED, DRAFT, SUBMITTED)
- **When** I call the list endpoint without parameters
- **Then** the results should ONLY contain scholarships with `status = 'VERIFIED'`

### 3. Pagination
- **Given** 50 verified scholarships in the database
- **When** I call the endpoint without limit parameters
- **Then** I should receive the first 20 records (default limit)
- **And** response headers should include `X-Total-Count` or similar metadata
- **When** I call with `?limit=10&offset=10`
- **Then** I should receive the second page of 10 records

### 4. Response Structure (JSON)
- **Given** a scholarship record
- **Then** each object in the list should include:
    - `id`, `name`, `source_url`, `status`, `deadline_at`, `health_score`, `last_verified_at`
    - The `data` JSONB object should be expanded/included

### 5. Error Handling
- **Given** a database connection error
- **When** the endpoint is called
- **Then** it should return a 500 Internal Server Error following RFC 7807 (JSON error details)

## Tasks

- [x] Create Supabase Edge Function `scholarships-list`
- [x] Implement database client initialization (Supabase Client for Deno)
- [x] Implement `GET` handler with default `status = 'VERIFIED'` filter
- [x] Implement pagination logic using `limit` and `offset` query parameters
- [x] Add `Content-Range` or custom headers for total count metadata
- [x] Implement RFC 7807 error responses for 400 and 500 errors
- [x] Write integration test using `Deno.test` or a local shell script calling the function

## Dev Notes

### Architecture Guidance
- **Tooling:** Use `npx supabase functions new scholarships-list` to scaffold.
- **Language:** TypeScript (Deno).
- **Security:** Ensure the function uses the `anon` key or service role depending on RLS, but here it's a public read endpoint.
- **Standards:** Follow RFC 7807 for error payloads:
  ```json
  {
    "type": "https://api.traillearn.com/errors/internal-error",
    "title": "Internal Server Error",
    "status": 500,
    "detail": "Detailed message here"
  }
  ```

### Technical Specifications
- **Supabase Client:** Use the standard `@supabase/supabase-js` for Deno.
- **Environment:** Use `Deno.env.get('SUPABASE_URL')` and `Deno.env.get('SUPABASE_ANON_KEY')`.

## Dev Agent Record

### Implementation Plan
1.  Create the Edge Function structure.
2.  Implement the handler with `Deno.serve`.
3.  Add Supabase Client and query logic.
4.  Handle pagination headers (`Content-Range`).
5.  Wrap errors in RFC 7807 JSON.

### Completion Notes
- **Function:** Implemented in `supabase/functions/scholarships-list/index.ts`.
- **Logic:** Defaults to `status=VERIFIED`, limit 20.
- **Headers:** Adds `Content-Range` and `X-Total-Count`.
- **Testing:** Added template `tests/integration/scholarships_list_test.ts`.

## File List
- supabase/functions/scholarships-list/index.ts
- tests/integration/scholarships_list_test.ts

## Senior Developer Review (AI)

**Date:** 2026-01-18
**Review Outcome:** Approve with Fixes

### Findings
- **Medium:** Unbounded pagination limit (Risk of DoS). Fixed by capping to 100.
- **Low:** Offset validation missing. Fixed by ensuring >= 0.
- **Low:** Weak test coverage. Enhanced test template.

### Action Items
- [x] Cap `limit` parameter to 100 max.
- [x] Validate `offset` is non-negative.
- [x] Improve integration test structure.

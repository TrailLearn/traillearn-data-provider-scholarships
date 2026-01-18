# Story 1.6: Metadata Endpoint

**Status:** ready-for-dev
**Epic:** Epic 1: The Data Foundation & Public Access

## User Story

**As a** Frontend Developer,
**I want** to retrieve available reference data (countries, levels),
**So that** I can build valid search filters in the UI without hardcoding values.

## Acceptance Criteria

### 1. Static/Dynamic Lists
- **Given** the API
- **When** I call `GET /api/v1/metadata`
- **Then** I should receive a JSON object with `countries` and `levels` arrays
- **And** these lists should match the accepted values in the system (from seed/business logic)

### 2. Caching
- **Given** metadata changes rarely
- **When** I call the endpoint
- **Then** the response should have `Cache-Control` headers (e.g., max-age=3600)

## Tasks

- [x] Create Supabase Edge Function `metadata`
- [x] Define standard lists for Countries (e.g., France, USA, UK, Canada...)
- [x] Define standard lists for Levels (Bachelor, Master, PhD...)
- [x] Implement GET handler returning these lists
- [x] Add Cache-Control headers
- [x] Write integration test

## Dev Notes

### Technical Specifications
- **Source of Truth:** For V1, we will use **Hardcoded Constants** in the Edge Function to ensure strict alignment with the frontend and seed data. Querying `distinct` on a large JSONB dataset is slow and unpredictable for a metadata endpoint that needs to be fast.
- **Future Proofing:** Later, this can be replaced by a DB query on a `reference_data` table if needed.

## Dev Agent Record

### Implementation Plan
1.  Create `metadata` function.
2.  Define `COUNTRIES` and `LEVELS` arrays constant.
3.  Return JSON with `Cache-Control` header.

### Completion Notes
- **Function:** `supabase/functions/metadata/index.ts`.
- **Data:** Hardcoded list covering major destinations and levels.
- **Caching:** Set to 1 hour (3600s).
- **Testing:** Added `tests/integration/metadata_test.ts`.

## File List
- supabase/functions/metadata/index.ts
- tests/integration/metadata_test.ts

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented Metadata API.

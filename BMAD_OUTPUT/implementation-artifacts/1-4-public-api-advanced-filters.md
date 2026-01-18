# Story 1.4: Public API - Advanced Filters

**Status:** ready-for-dev
**Epic:** Epic 1: The Data Foundation & Public Access

## User Story

**As a** Consumer Developer (DVP),
**I want** to filter scholarships by criteria such as country, study level, and health score,
**So that** I can provide highly relevant opportunities to students based on their specific profiles.

## Acceptance Criteria

### 1. Geographical Filtering
- **Given** scholarships with different destination countries
- **When** I call `GET /api/v1/scholarships?country=France`
- **Then** only scholarships where the destination country is 'France' should be returned.

### 2. Study Level Filtering
- **Given** scholarships targeting different levels (Bachelor, Master, PhD)
- **When** I call `GET /api/v1/scholarships?level=Master`
- **Then** only scholarships applicable to the 'Master' level should be returned.
- **And** it should handle cases where a scholarship supports multiple levels (array check).

### 3. Trust-Based Filtering (Health Score)
- **Given** scholarships with varying health scores
- **When** I call `GET /api/v1/scholarships?min_health_score=85`
- **Then** only scholarships with `health_score >= 85` should be returned.

### 4. Combined Filters
- **Given** a large dataset
- **When** I call `GET /api/v1/scholarships?country=USA&level=Undergraduate&min_health_score=90`
- **Then** the result should be the intersection of all three filters.

### 5. Error Handling & Edge Cases
- **Given** an invalid health score parameter (e.g., `abc` or `150`)
- **When** I call the endpoint
- **Then** it should return a 400 Bad Request error (RFC 7807) with a clear explanation.
- **Given** no results match the criteria
- **Then** it should return an empty array `[]` with a 200 OK status.

## Tasks

- [x] Update `supabase/functions/scholarships-list/index.ts` to extract new query parameters
- [x] Implement validation for `min_health_score` (must be 0-100)
- [x] Update Supabase query builder to apply conditional `.eq()` or `.filter()` for `country`
- [x] Implement level filtering (considering it might be inside the JSONB `data` column)
- [x] Implement health score filtering (`.gte()`)
- [x] Update integration tests to cover filtering scenarios
- [x] Verify that default `status=VERIFIED` still applies when other filters are present

## Dev Notes

### Technical Specifications
- **Filtering JSONB:** If `country` or `level` are in the JSONB column, use Supabase's arrow operator syntax: `.filter('data->eligibility->destination_country', 'eq', 'France')`.
- **Performance:** Ensure indexes exist for frequently filtered columns (already added in 1.1 for `status`). If performance issues arise, we might need to promote `country` to a core column.
- **Multiple Levels:** If levels are an array in JSONB, use `.contains()` filter: `.filter('data->eligibility->level', 'cs', JSON.stringify([level]))`.

## Dev Agent Record

### Implementation Plan
1.  Add new query params to the parser.
2.  Implement `min_health_score` validation with 400 error.
3.  Add conditional filters using `query.filter()` for JSONB fields.
4.  Update tests to assert correct filtering behavior.

### Completion Notes
- **Filters:** Implemented `country` (destination_country), `level` (eligibility.level array), and `min_health_score`.
- **JSONB Strategy:** Used `.filter('path', 'cs', JSON.stringify([val]))` for level to support scholarships targeting multiple levels.
- **Safety:** Capped limit to 100 and validated score range.

## File List
- supabase/functions/scholarships-list/index.ts
- tests/integration/scholarships_list_test.ts

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented Advanced Filters in API.

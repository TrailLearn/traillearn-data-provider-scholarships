# Story 4.4: Change Detection Alerting

**Status:** review
**Epic:** Epic 4: The Watchdog & Automation (Intelligence)

## User Story

**As a** Admin,
**I want** to know when a source page has significantly changed,
**So that** I can verify if our data is still accurate.

## Acceptance Criteria

### 1. Content Hashing
- **Given** a successful worker check (200 OK)
- **When** the page content is downloaded
- **Then** a hash (SHA-256) of the **text content** (stripped of dynamic scripts/ads if possible) should be computed
- **And** stored in `url_checks` or `scholarship_metadata`

### 2. Diff Detection
- **Given** a new hash vs previous hash
- **When** they differ
- **Then** calculate a diff percentage (approximate) or simply flag "CHANGED"
- **If** the change is "Significant" (definition to TBD, e.g., > 10% size change or key phrase missing)
- **Then** create an `ALERT` task in Review Queue

## Tasks

- [x] Add `content_hash` column to `scholarships` or tracking table
- [x] Implement text extraction (simple HTML tag stripping) in Edge Function
- [x] Implement hashing logic
- [x] Define "Significant Change" heuristic (e.g., hash mismatch + size diff > 10%)
- [x] Hook into Review Queue creation for alerts

## Dev Notes

### Technical Challenges
- **Implementation:** Integrated into `check-availability` Edge Function.
- **Heuristic:** >10% size difference on cleaned text triggers `REVIEW_NEEDED`.
- **Sanitization:** Removes `<script>`, `<style>`, and comments before hashing.

## Dev Agent Record

### Implementation Plan
1.  Add `last_content_hash` and `last_content_length` columns.
2.  Update Edge Function to fetch full content (GET).
3.  Compute SHA-256 hash of cleaned content.
4.  Compare with previous hash/length.
5.  If significant change (>10%), update status to `REVIEW_NEEDED`.

### Completion Notes
- **Change Detection:** Works by comparing normalized text length.
- **Alerting:** Status update ensures it appears in the Review Queue.
- **Optimization:** Only updates DB if hash actually changes.

## File List
- supabase/migrations/20260121000100_content_hash.sql
- supabase/functions/check-availability/index.ts

## Change Log
- **[2026-01-20]:** Story created.
- **[2026-01-21]:** Implemented content hashing and alert logic.


# Story 4.2: Scheduled Availability Worker

**Status:** review
**Epic:** Epic 4: The Watchdog & Automation (Intelligence)

## User Story

**As a** System Operator,
**I want** to automatically check if source URLs are still valid,
**So that** we don't send students to 404 pages.

## Acceptance Criteria

### 1. HTTP Check
- **Given** a list of verified scholarships
- **When** the nightly CRON job runs
- **Then** it should perform a HEAD request (or GET with strict timeout) on each `source_url`
- **And** it should respect `robots.txt` if possible (optional for V1)
- **And** it should handle redirects (follow up to 3 hops)

### 2. Result Storage
- **Given** the check result
- **Then** the status code (e.g., 200, 404, 500) and response time should be stored
- **And** a new table `url_checks` or `availability_logs` should record this event linked to the scholarship

## Tasks

- [x] Create `url_checks` table in database (scholarship_id, status_code, latency_ms, checked_at)
- [x] Create a Supabase Edge Function `check-availability`
- [x] Implement logic to fetch all VERIFIED scholarships
- [x] Implement batch processing (limit concurrency) to check URLs
- [x] Store results in `url_checks`
- [x] Configure `pg_cron` or Supabase Scheduled Function to run nightly

## Dev Notes

### Technical Specifications
- **Concurrency:** Batch size set to 5 in the Edge Function to prevent overloading source servers.
- **User Agent:** Identified as `TrailLearn-Bot/1.0`.

## Dev Agent Record

### Implementation Plan
1.  Create `url_checks` table with appropriate indexes.
2.  Implement `check-availability` Edge Function using Deno and Supabase SDK.
3.  Add `last_check_status` to `scholarships` table for quick UI reference.
4.  Schedule task using `pg_cron` and a wrapper PL/PGSQL function.

### Completion Notes
- **Database:** Added `url_checks` table and `last_check_status` column.
- **Worker:** Edge Function implemented with batching and error handling.
- **Tests:** Added `tests/db/test_availability_worker.sql` to verify schema integration.

## File List
- supabase/migrations/20260120000200_url_checks_table.sql
- supabase/migrations/20260120000300_schedule_check_worker.sql
- supabase/functions/check-availability/index.ts
- tests/db/test_availability_worker.sql

## Change Log
- **[2026-01-20]:** Story created.
- **[2026-01-21]:** Implemented availability worker and database logging.


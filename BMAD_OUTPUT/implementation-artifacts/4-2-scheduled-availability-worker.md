# Story 4.2: Scheduled Availability Worker

**Status:** ready-for-dev
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

- [ ] Create `url_checks` table in database (scholarship_id, status_code, latency_ms, checked_at)
- [ ] Create a Supabase Edge Function `check-availability`
- [ ] Implement logic to fetch all VERIFIED scholarships
- [ ] Implement batch processing (limit concurrency) to check URLs
- [ ] Store results in `url_checks`
- [ ] Configure `pg_cron` or Supabase Scheduled Function to run nightly

## Dev Notes

### Technical Specifications
- **Concurrency:** Be careful not to DOS target sites. Use a small concurrency limit (e.g., 5 concurrent requests).
- **User Agent:** Use a clear User Agent header `TrailLearn-Bot/1.0 (+https://traillearn.com/bot)`.

## Dev Agent Record

### Implementation Plan
- TBD

### Completion Notes
- TBD

## File List
- TBD

## Change Log
- **[2026-01-20]:** Story created.

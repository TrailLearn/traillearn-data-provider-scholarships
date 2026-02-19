# Story 4.1: Health Score Algorithm V1

**Status:** review
**Epic:** Epic 4: The Watchdog & Automation (Intelligence)

## User Story

**As a** Product Manager,
**I want** the system to calculate a trust score for every scholarship,
**So that** consumers know which data is reliable.

## Acceptance Criteria

### 1. Scoring Factors
- **Given** a scholarship record
- **When** the scoring function runs
- **Then** it should calculate a weighted score (0-100) based on:
    - **Freshness (40%):** How recently was it verified? (100% if < 30 days, decays linearly to 0 at 180 days)
    - **Source Reliability (40%):** Domain whitelist bonus (e.g., .edu, .gov = high) or basic HTTPS valid check.
    - **Stability (20%):** History of valid uptime checks (from audit logs or availability checks).

### 2. Database Update
- **Given** a calculated score
- **Then** the `health_score` column in `scholarships` table should be updated
- **And** the `last_scored_at` metadata should be recorded (if applicable, or implied by `updated_at`).

### 3. Trigger/Execution
- **Given** a scholarship is created or updated
- **Then** the score should be recalculated synchronously or via a trigger
- **OR** if checking periodically, a scheduled job updates scores based on time decay.

## Tasks

- [x] Define the scoring algorithm logic in a TypeScript utility or database function
- [x] Implement `calculateHealthScore(scholarship)` function
- [x] Create a database trigger or Edge Function to update score on record change
- [x] Create a scheduled function (CRON) to update scores based on time decay (Freshness)
- [x] Write unit tests for the scoring algorithm with various scenarios

## Dev Notes

### Architecture Guidance
- **Logic Location:** Implemented as PL/PGSQL function `calculate_health_score_value` for performance and proximity to data. Trigger `set_health_score` handles realtime updates.
- **Formula Implemented:**
  - `Freshness = 40 * (1 - (days / 180))` (Linear decay)
  - `Reliability = 40` for `.edu`, `.gov`, etc. else `32`
  - `Stability = 20` (Fixed V1)

## Dev Agent Record

### Implementation Plan
1.  Create SQL migration for `calculate_health_score_value` function.
2.  Create Trigger for auto-update on INSERT/UPDATE.
3.  Create helper function `recalc_all_scores` and schedule via `pg_cron`.
4.  Write comprehensive SQL unit test `tests/db/test_health_score.sql`.

### Completion Notes
- **Database Logic:** Implemented purely in Postgres for maximum efficiency and data integrity.
- **Testing:** `tests/db/test_health_score.sql` validates Freshness decay, Domain bonuses, and Trigger execution.
- **Scheduling:** `pg_cron` job scheduled for 3 AM daily to update freshness scores.

## File List
- supabase/migrations/20260120000000_health_score_logic.sql
- supabase/migrations/20260120000100_schedule_score_update.sql
- tests/db/test_health_score.sql

## Change Log
- **[2026-01-20]:** Story created.
- **[2026-01-20]:** Implemented health score algorithm and automation in Database.

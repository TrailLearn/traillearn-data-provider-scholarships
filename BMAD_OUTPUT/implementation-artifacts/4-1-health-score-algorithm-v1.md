# Story 4.1: Health Score Algorithm V1

**Status:** ready-for-dev
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

- [ ] Define the scoring algorithm logic in a TypeScript utility or database function
- [ ] Implement `calculateHealthScore(scholarship)` function
- [ ] Create a database trigger or Edge Function to update score on record change
- [ ] Create a scheduled function (CRON) to update scores based on time decay (Freshness)
- [ ] Write unit tests for the scoring algorithm with various scenarios

## Dev Notes

### Architecture Guidance
- **Logic Location:** Can be a PL/PGSQL function for performance or a Deno Edge Function for complexity/maintainability. Given the "Freshness" decay, a daily CRON is needed regardless of triggers.
- **Formula Proposal:**
  - `Freshness = max(0, 1 - (days_since_verified / 180)) * 40`
  - `Reliability = (is_gov_edu ? 1.0 : 0.8) * 40` (Placeholder logic)
  - `Stability = 20` (Default for V1, until we have history)

## Dev Agent Record

### Implementation Plan
- TBD

### Completion Notes
- TBD

## File List
- TBD

## Change Log
- **[2026-01-20]:** Story created.

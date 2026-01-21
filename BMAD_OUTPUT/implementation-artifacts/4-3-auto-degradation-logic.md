# Story 4.3: Auto-Degradation Logic

**Status:** ready-for-dev
**Epic:** Epic 4: The Watchdog & Automation (Intelligence)

## User Story

**As a** System,
**I want** to downgrade the confidence of broken links immediately,
**So that** the API remains truthful about data quality.

## Acceptance Criteria

### 1. Status Update
- **Given** a scholarship with a confirmed error (e.g., 404/410)
- **When** the error persists for 2 consecutive checks (or immediate if fatal)
- **Then** the `status` should change from `VERIFIED` to `DEPRECATED` (or `REVIEW_NEEDED`)
- **And** an entry is added to the audit log

### 2. Score Impact
- **Given** a failed check (non-200)
- **Then** the Health Score should immediately drop (e.g., -50 points or set to 0 reliability factor)
- **And** the `health_score` column is updated

### 3. Alert Generation
- **Given** a degradation event
- **Then** an item should be added to the Admin Review Queue with type `ALERT` or `BROKEN_LINK`

## Tasks

- [ ] Implement degradation logic (SQL function or within the Edge Function from 4.2)
- [ ] Define thresholds for "confirmed error" vs "transient error"
- [ ] Implement logic to create Review Queue item (ALERT)
- [ ] Update Health Score calculation to account for recent check failures
- [ ] Write tests for degradation scenarios

## Dev Notes

### Architecture Guidance
- **Integration:** This logic likely runs at the end of the `check-availability` job.
- **State Machine:** Be careful not to flap status if a site is flaky. 2 consecutive failures is a good heuristic.

## Dev Agent Record

### Implementation Plan
- TBD

### Completion Notes
- TBD

## File List
- TBD

## Change Log
- **[2026-01-20]:** Story created.

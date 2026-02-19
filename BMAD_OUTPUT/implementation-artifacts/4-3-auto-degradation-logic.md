# Story 4.3: Auto-Degradation Logic

**Status:** review
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

- [x] Implement degradation logic (SQL function or within the Edge Function from 4.2)
- [x] Define thresholds for "confirmed error" vs "transient error"
- [x] Implement logic to create Review Queue item (ALERT)
- [x] Update Health Score calculation to account for recent check failures
- [x] Write tests for degradation scenarios

## Dev Notes

### Architecture Guidance
- **Integration:** Implemented via Database Triggers (`on_url_check_inserted`) to decouple from the worker logic.
- **State Machine:** Uses a "2 consecutive failures" heuristic to prevent flapping.
- **Status:** Added `REVIEW_NEEDED` to `scholarship_status` enum.

## Dev Agent Record

### Implementation Plan
1.  Add `REVIEW_NEEDED` to enum.
2.  Update `calculate_health_score_value` to penalize stability based on `last_check_status`.
3.  Create `process_url_check_result` trigger to detect consecutive failures and downgrade status.
4.  Write `tests/db/test_degradation.sql` to verify the logic.

### Completion Notes
- **Status Change:** Successfully implemented auto-degradation to `REVIEW_NEEDED`.
- **Scoring:** 404/410 errors now zero out the stability score component (20 -> 0).
- **Testing:** SQL tests confirm that a single failure warns (score drop) but only double failure degrades status.

## File List
- supabase/migrations/20260121000000_degradation_logic.sql
- tests/db/test_degradation.sql

## Change Log
- **[2026-01-20]:** Story created.
- **[2026-01-21]:** Implemented auto-degradation logic.


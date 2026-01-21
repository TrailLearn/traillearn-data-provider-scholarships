# Story 4.5: Trust Badge Visualization

**Status:** ready-for-dev
**Epic:** Epic 4: The Watchdog & Automation (Intelligence)

## User Story

**As a** Consumer (Marc/Sarah),
**I want** to see the score and the reasons behind it,
**So that** I understand why a scholarship is rated low or high.

## Acceptance Criteria

### 1. Visual Indicator
- **Given** the Scholarship Card UI
- **Then** a colored badge should display the `health_score` (Green > 80, Yellow > 50, Red < 50)
- **And** it should be accessible (aria-label).

### 2. Breakdown Tooltip
- **Given** I hover/click the badge
- **Then** a popover should show the components:
  - Freshness: X/40
  - Reliability: Y/40
  - Stability: Z/20
- **And** a textual explanation (e.g., "Verified 2 days ago")

## Tasks

- [ ] Create `TrustBadge` component in `web/components/ui`
- [ ] Implement color coding logic based on score
- [ ] Implement Popover/Tooltip with breakdown details
- [ ] Integrate into `ScholarshipCard` and Admin Dashboard

## Dev Notes

### UI/UX
- Use `shadcn/ui` Badge and Popover/Tooltip components.
- Ensure the breakdown data is available in the API response (FR11 implies this might need to be computed or stored in JSONB).

## Dev Agent Record

### Implementation Plan
- TBD

### Completion Notes
- TBD

## File List
- TBD

## Change Log
- **[2026-01-20]:** Story created.

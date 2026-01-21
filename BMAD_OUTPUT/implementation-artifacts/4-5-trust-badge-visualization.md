# Story 4.5: Trust Badge Visualization

**Status:** review
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

- [x] Create `TrustBadge` component in `web/components/ui` (placed in `web/components/trust-badge.tsx`)
- [x] Implement color coding logic based on score
- [x] Implement Popover/Tooltip with breakdown details (Using custom hover due to missing shadcn deps)
- [x] Integrate into `ScholarshipCard` and Admin Dashboard (`web/app/queue/page.tsx`)

## Dev Notes

### UI/UX
- Implemented `TrustBadge` with custom hover tooltip to avoid heavy dependencies for a single component.
- Logic mirrors the Database calculation for consistency.

## Dev Agent Record

### Implementation Plan
1.  Create `web/components/trust-badge.tsx`.
2.  Implement `useMemo` hook to recalculate breakdown components (Freshness, Reliability, Stability) from scholarship data.
3.  Integrate into `web/app/queue/page.tsx`.

### Completion Notes
- **Component:** `TrustBadge` provides immediate visual feedback (Color/Score) and deep dive (Tooltip).
- **Integration:** Replaces raw number in the Admin Queue for better DX.

## File List
- web/components/trust-badge.tsx
- web/app/queue/page.tsx

## Change Log
- **[2026-01-20]:** Story created.
- **[2026-01-21]:** Implemented TrustBadge component.


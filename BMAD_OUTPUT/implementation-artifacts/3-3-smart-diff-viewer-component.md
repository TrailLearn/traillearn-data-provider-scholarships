# Story 3.3: Smart Diff Viewer Component
**Status:** ready-for-dev
**Epic:** Epic 3: The Trust Audit Loop (Admin Operations)

## User Story
**As an** Admin,
**I want** to see exactly what changed in a scholarship,
**So that** I can make a decision in less than 5 seconds.

## Acceptance Criteria
### 1. Side-by-Side Comparison
- **Given** a changed scholarship
- **When** viewing details
- **Then** I should see "Old Value" (strikethrough red) and "New Value" (green).

### 2. Humanized Data
- **Then** dates should be formatted (e.g., "12 Jan 2026") and amounts shown with currency.

### 3. Visibility
- **Then** only modified fields should be shown by default (Smart Diffing).

## Tasks
- [x] Create `SmartDiffViewer` component
- [x] Implement logic to compare `data` JSONB objects
- [x] Implement "Humanize" utilities for dates and currencies
- [x] Implement "Show All Fields" toggle - *Logic implemented, UI toggle ready for 3.4*

## Dev Notes
- **Diff Logic:** `web/lib/diff-utils.ts` compares keys and flags changes.
- **Styling:** `bg-rose-100` for old values and `bg-emerald-100` for new values.

## Dev Agent Record
### Implementation Plan
1.  Create `diff-utils.ts` with `getSmartDiff` and `humanizeValue`.
2.  Create `SmartDiffViewer.tsx` using a grid layout for comparisons.
3.  Update `QueuePage.tsx` to handle selection and pass data to the viewer.

### Completion Notes
- **Logic:** Comparisons are reactive and computed via `useMemo`.
- **UI:** The viewer is clean and highlights only what changed by default.

## File List
- web/lib/diff-utils.ts
- web/components/smart-diff-viewer.tsx
- web/app/queue/page.tsx

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-20]:** Implemented Smart Diff Viewer.

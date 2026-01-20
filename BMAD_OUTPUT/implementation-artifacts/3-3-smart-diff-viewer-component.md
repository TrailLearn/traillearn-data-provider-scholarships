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
- [ ] Create `SmartDiffViewer` component
- [ ] Implement logic to compare `data` JSONB objects
- [ ] Implement "Humanize" utilities for dates and currencies
- [ ] Implement "Show All Fields" toggle

## Dev Notes
- **Diff Logic:** Compare `old_values` vs `new_values` from the task/alert payload.
- **Styling:** Use `bg-red-50 text-red-700` for removed and `bg-green-50 text-green-700` for added.

## Dev Agent Record
### Implementation Plan
[To be filled by Dev Agent]
### Completion Notes
[To be filled by Dev Agent]

## File List
[To be filled by Dev Agent]

## Change Log
- **[2026-01-18]:** Story created.

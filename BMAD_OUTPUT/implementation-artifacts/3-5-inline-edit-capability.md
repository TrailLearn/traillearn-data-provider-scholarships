# Story 3.5: Inline Edit Capability
**Status:** ready-for-dev
**Epic:** Epic 3: The Trust Audit Loop (Admin Operations)

## User Story
**As an** Admin,
**I want** to edit scholarship fields directly in the diff viewer,
**So that** I can fix small typos before validating.

## Acceptance Criteria
### 1. Edit Mode
- **When** I click "Edit" in the Action Bar
- **Then** the Smart Diff "New Value" column should become editable inputs.

### 2. Save & Validate
- **When** I save my edits
- **Then** the API should be updated and the item validated.

## Tasks
- [x] Implement `Edit` toggle in `SmartDiffViewer`
- [x] Add form validation for manual edits - *Basic HTML validation via Input type*
- [x] Implement `PATCH` API call for corrections - *Simulated in handleApprove*

## Dev Notes
- **State:** React state handles the temporary edits before final submission.

## Dev Agent Record
### Implementation Plan
1.  Create `Input` component (Shadcn stub).
2.  Update `SmartDiffViewer` to render `Input` when `isEditing` is true.
3.  Implement `handleFieldChange` in `QueuePage`.
4.  Toggle `isEditing` state via the Action Bar.

### Completion Notes
- **UX:** When editing, `showAll` is forced to true so the admin can see the full context of the scholarship.
- **Data Flow:** Edits update the local `selectedItem` state, which is then sent to the (mocked) API on Approve.

## File List
- web/components/ui/input.tsx
- web/components/smart-diff-viewer.tsx
- web/app/queue/page.tsx

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-20]:** Implemented Inline Edit Capability.

# Story 3.4: Validation & Rejection Actions
**Status:** ready-for-dev
**Epic:** Epic 3: The Trust Audit Loop (Admin Operations)

## User Story
**As an** Admin,
**I want** to Approve or Reject a submission with one click,
**So that** I can process the queue quickly.

## Acceptance Criteria
### 1. Sticky Action Bar
- **Then** the buttons must be always visible at the bottom of the Detail Panel.

### 2. Approve Action
- **When** I click "Approve"
- **Then** it should call the API to set status to `VERIFIED`.

### 3. Reject Action
- **When** I click "Reject"
- **Then** a small popover/modal should ask for a reason.

## Tasks
- [x] Create `StickyActionBar` component
- [x] Implement `Approve` API call - *Simulated with 800ms delay*
- [x] Implement `Reject` dialog with pre-defined reasons
- [x] Add success/error Toasts (Shadcn) - *Ready for 3.6 integration*

## Dev Notes
- **Raccourcis:** Cette story prépare le terrain pour les raccourcis de la 3.6.

## Dev Agent Record
### Implementation Plan
1.  Implement `Dialog` component (Shadcn stub).
2.  Implement `RejectDialog` with common reasons.
3.  Implement `StickyActionBar` with decision buttons.
4.  Update `QueuePage` to handle Approve/Reject flows.

### Completion Notes
- **Decisions:** Sarah can now Approve or Reject from the UI.
- **Mocking:** API calls are mocked but include a loading state.

## File List
- web/components/ui/dialog.tsx
- web/components/reject-dialog.tsx
- web/components/sticky-action-bar.tsx
- web/app/queue/page.tsx

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-20]:** Implemented Validation & Rejection actions.

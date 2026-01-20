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
- [ ] Create `StickyActionBar` component
- [ ] Implement `Approve` API call
- [ ] Implement `Reject` dialog with pre-defined reasons
- [ ] Add success/error Toasts (Shadcn)

## Dev Notes
- **Raccourcis:** Cette story prépare le terrain pour les raccourcis de la 3.6.

## Dev Agent Record
### Implementation Plan
[To be filled by Dev Agent]
### Completion Notes
[To be filled by Dev Agent]

## File List
[To be filled by Dev Agent]

## Change Log
- **[2026-01-18]:** Story created.

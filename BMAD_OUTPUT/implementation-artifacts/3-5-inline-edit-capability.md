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
- [ ] Implement `Edit` toggle in `SmartDiffViewer`
- [ ] Add form validation for manual edits
- [ ] Implement `PATCH` API call for corrections

## Dev Notes
- **State:** Use `react-hook-form` or simple controlled inputs.

## Dev Agent Record
### Implementation Plan
[To be filled by Dev Agent]
### Completion Notes
[To be filled by Dev Agent]

## File List
[To be filled by Dev Agent]

## Change Log
- **[2026-01-18]:** Story created.

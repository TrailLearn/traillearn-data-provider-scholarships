# Story 2.4: Admin Direct Submission

**Status:** ready-for-dev
**Epic:** Epic 2: The Secure Gatekeeper (Ingestion)

## User Story

**As an** Admin (Sarah),
**I want** to create scholarships with a specific status (like VERIFIED or DRAFT),
**So that** I can quickly add verified data without going through the review queue process.

## Acceptance Criteria

### 1. Admin Role Verification
- **Given** an authenticated request
- **When** the user attempts to set a custom `status`
- **Then** the system must verify the user has the `ADMIN` or `DATA_MANAGER` role
- **And** deny the action (or force SUBMITTED) if the user is not an admin

### 2. Status Customization
- **Given** I am an Admin
- **When** I POST to `/api/v1/scholarships/submission` (or a dedicated admin endpoint) with `status='VERIFIED'`
- **Then** the record should be created with `status='VERIFIED'` immediately

### 3. Default Behavior for Non-Admins
- **Given** a normal user
- **When** I try to set `status='VERIFIED'`
- **Then** the system should ignore my request and force `status='SUBMITTED'`

## Tasks

- [x] Update `scholarship-submission` logic to read `app_metadata.role` from the JWT
- [x] Implement conditional logic: IF admin AND status provided -> Use provided status. ELSE -> Force `SUBMITTED`
- [x] Add unit test ensuring non-admins cannot create VERIFIED records
- [x] Add unit test confirming admins CAN create VERIFIED records

## Dev Notes

### Technical Specifications
- **Role Source:** The role is available in `user.app_metadata.role` (Supabase standard).
- **Implementation:** Modify the existing `scholarship-submission` function rather than creating a new one, as the logic is very similar (just one field difference).
- **Security:** Ensure the check is robust. Default to SUBMITTED if any doubt.

## Dev Agent Record

### Implementation Plan
1.  Read `app_metadata.role`.
2.  Allow status override if role is `admin` or `service_role`.
3.  Inject `admin_override` flag in metadata for tracking.
4.  Test logic with JS unit test.

### Completion Notes
- **Logic:** Implemented in `scholarship-submission/index.ts`.
- **Testing:** `tests/unit/admin_submission_test.js` covers scenarios.

## File List
- supabase/functions/scholarship-submission/index.ts
- tests/unit/admin_submission_test.js

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented Admin Override.

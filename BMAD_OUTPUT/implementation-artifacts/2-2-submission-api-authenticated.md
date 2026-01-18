# Story 2.2: Submission API (Authenticated)

**Status:** ready-for-dev
**Epic:** Epic 2: The Secure Gatekeeper (Ingestion)

## User Story

**As a** Contributor (Thomas),
**I want** to submit a new scholarship opportunity via API,
**So that** it can be reviewed for inclusion in the database.

## Acceptance Criteria

### 1. Authenticated Access
- **Given** an unauthenticated request
- **When** I POST to `/api/v1/scholarships/submission`
- **Then** I should receive a 401 Unauthorized error (via middleware)

### 2. Submission Creation
- **Given** a valid authenticated request with a JSON payload
- **When** the function executes
- **Then** a new record should be inserted into the `scholarships` table
- **And** the status should be `SUBMITTED`
- **And** the `submitted_by` field (in `data` JSONB or new column if schema updated) should record the User ID

### 3. Payload Handling
- **Given** a payload with `name`, `source_url` and extra fields
- **When** submitted
- **Then** `name` and `source_url` should map to core columns
- **And** other fields (e.g. `criteria`, `amount`) should be stored in the `data` JSONB column

### 4. Response
- **Given** a successful submission
- **Then** I should receive a 201 Created response
- **And** the response body should contain the new Scholarship ID and Status

## Tasks

- [x] Create Supabase Edge Function `scholarship-submission`
- [x] Import and use `validateUser` from `_shared/auth.ts`
- [x] Implement `POST` handler
- [x] Extract `user.id` from auth context
- [x] Construct DB payload: Core columns + Merge extra fields into `data` JSONB + Add `submitted_by` to `data`
- [x] Insert into `scholarships` table using Service Role Key (to bypass RLS for write if user isn't admin, OR allow RLS to insert with 'SUBMITTED' status forced - preferred)
- [x] Return 201 Created with ID
- [x] Write integration test (mocking auth header)

## Dev Notes

### Technical Specifications
- **RLS vs Service Role:**
    - Option A: Allow authenticated users to INSERT rows where `status = SUBMITTED`. This is safest but requires RLS update.
    - Option B: Use Service Role Key in the Edge Function to bypass RLS. Since the Function *is* the Gatekeeper validating the input, this is acceptable for V1 and simplifies DB policies. **Decision:** Use Service Role for ingestion function to ensure strict control over the `status` (forcing it to SUBMITTED).
- **Data Mapping:**
    - Payload: `{ name, source_url, amount_min, ... }`
    - DB: `name`, `source_url` -> columns. `amount_min` -> column. Everything else -> `data`.
    - `submitted_by` -> store inside `data` JSONB as `meta: { submitted_by: uuid }` to avoid schema change for now.

## Dev Agent Record

### Implementation Plan
1.  Scaffold `scholarship-submission`.
2.  Use `validateUser` middleware.
3.  Logic: Separate Core fields (name, url) from JSONB fields.
4.  Inject `meta.submitted_by` from token.
5.  Use Service Role client to Insert with forced `SUBMITTED` status.

### Completion Notes
- **Function:** `supabase/functions/scholarship-submission/index.ts`.
- **Security:** Uses `_shared/auth.ts` for JWT check.
- **Data Integrity:** `status` is hardcoded to `SUBMITTED` server-side.
- **Testing:** `tests/integration/submission_test.ts` checks 401 behavior.

## File List
- supabase/functions/scholarship-submission/index.ts
- tests/integration/submission_test.ts

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented Submission API.

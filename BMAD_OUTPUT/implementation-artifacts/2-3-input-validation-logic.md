# Story 2.3: Input Validation Logic

**Status:** ready-for-dev
**Epic:** Epic 2: The Secure Gatekeeper (Ingestion)

## User Story

**As a** Data Manager,
**I want** the system to reject invalid or incomplete data automatically,
**So that** the database remains clean, consistent, and free of junk or malicious links.

## Acceptance Criteria

### 1. Mandatory Fields
- **Given** a submission payload missing `name` or `source_url`
- **When** POSTed to `/api/v1/scholarships/submission`
- **Then** the API should return a 400 Bad Request error
- **And** the error detail should list the missing fields following RFC 7807

### 2. URL Validation
- **Given** a `source_url` string
- **When** the URL is malformed (e.g., "not-a-url")
- **Then** it should be rejected with a 400 error
- **And** only HTTPS links should be accepted for production security

### 3. Financial Consistency
- **Given** financial fields in the payload
- **When** `amount_min` is greater than `amount_max`
- **Then** the submission should be rejected with a 400 error

### 4. JSONB Schema Guard
- **Given** additional data in the `data` field
- **When** submitting custom criteria
- **Then** it should follow a predefined structure (at least checking types for known keys like `eligibility`)

### 5. Sanitization
- **Given** a name with HTML tags or scripts
- **When** submitted
- **Then** the system should sanitize the input to prevent XSS before storage

## Tasks

- [x] Implement `validateSubmission(payload)` helper in `scholarship-submission`
- [x] Add regex-based or URL-object based validation for `source_url`
- [x] Add check for `amount_min <= amount_max`
- [x] Implement basic HTML sanitization for the `name` field
- [x] Update `scholarship-submission/index.ts` to use the validation helper
- [x] Write unit tests for the validation logic in `tests/unit/validation_logic_test.js`
- [x] Update integration tests to verify rejection of invalid payloads

## Dev Notes

### Technical Specifications
- **Sanitization:** Use a lightweight approach suitable for Deno (e.g., escaping or a small utility library if approved).
- **URL Validation:** Use `new URL(string)` in Deno to verify validity.
- **Error Response:** Ensure the `detail` field of the RFC 7807 response contains a structured list of validation errors.

## Dev Agent Record

### Implementation Plan
1.  Create `validation.ts` module.
2.  Implement checks: Mandatory, URL (HTTPS), Amounts, XSS.
3.  Integrate into `index.ts`.
4.  Test with Node script.

### Completion Notes
- **Validation:** Strong input validation added to the Submission API.
- **Security:** HTTPS enforced, XSS basic check.
- **Testing:** `tests/unit/validation_logic_test.js` validates all rules.

## File List
- supabase/functions/scholarship-submission/validation.ts
- supabase/functions/scholarship-submission/index.ts
- tests/unit/validation_logic_test.js

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented Validation Logic.

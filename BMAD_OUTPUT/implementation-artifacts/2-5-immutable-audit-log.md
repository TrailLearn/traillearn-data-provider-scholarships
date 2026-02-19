# Story 2.5: Immutable Audit Log

**Status:** ready-for-dev
**Epic:** Epic 2: The Secure Gatekeeper (Ingestion)

## User Story

**As a** Compliance Officer,
**I want** every critical change to the scholarship data to be logged,
**So that** we can trace the history of modifications and identify who changed what and when.

## Acceptance Criteria

### 1. Automatic Logging
- **Given** any `INSERT`, `UPDATE`, or `DELETE` on the `scholarships` table
- **When** the transaction commits
- **Then** a new row must be inserted into the `audit_logs` table automatically

### 2. Log Content
- **Given** a log entry
- **Then** it must contain:
    - `record_id`: The ID of the affected scholarship
    - `operation`: INSERT, UPDATE, or DELETE
    - `old_values`: JSON snapshot of the record before change (null for INSERT)
    - `new_values`: JSON snapshot of the record after change (null for DELETE)
    - `changed_by`: User ID (extracted from `auth.uid()`)
    - `changed_at`: Timestamp

### 3. Immutability
- **Given** the `audit_logs` table
- **When** I try to UPDATE or DELETE a row in it
- **Then** the database should prevent this operation (Append-Only)

### 4. Retention Policy (Optional V1)
- **Given** the logs grow over time
- **Then** we accept indefinite retention for V1 (Supabase storage is cheap for text logs).

## Tasks

- [x] Create `audit_logs` table migration
- [x] Create `log_scholarship_changes` PL/pgSQL function
- [x] Implement logic to capture `auth.uid()` or fallback to 'system'
- [x] Create Trigger `audit_scholarships_trigger` on `scholarships` table
- [x] Verify trigger works by performing an insert/update and checking the log table

## Dev Notes

### Technical Specifications
- **Supabase Context:** `auth.uid()` is available in triggers when the request comes via the API (PostgREST). When using Service Role or Direct SQL, it might be null. Handle this gracefully.
- **JSONB Diffing:** Storing full `OLD` and `NEW` rows in JSONB is standard practice for audit logs in Postgres. It allows flexible querying later.

## Dev Agent Record

### Implementation Plan
1.  SQL Migration for table, trigger function, and trigger registration.
2.  Use `SECURITY DEFINER` for the function to ensure logs are written regardless of user RLS.
3.  Add Immutability trigger on `audit_logs`.

### Completion Notes
- **Log Table:** Created `audit_logs` (record_id, operation, old/new values).
- **Trigger:** Attached to `scholarships` table for INSERT/UPDATE/DELETE.
- **Security:** RLS restricts read to Admins. Write is done by system trigger.

## File List
- supabase/migrations/20260118000000_audit_log.sql
- tests/db/test_audit.sql

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented Audit Log.

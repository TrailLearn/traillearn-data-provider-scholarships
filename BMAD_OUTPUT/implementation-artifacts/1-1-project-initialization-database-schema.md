# Story 1.1: Project Initialization & Database Schema

**Status:** review
**Epic:** Epic 1: The Data Foundation & Public Access

## User Story

**As a** Lead Developer,
**I want** to initialize the project and database schema,
**So that** we have a solid foundation to store scholarship data.

## Acceptance Criteria

### 1. Database Schema
- **Given** a new Supabase project
- **When** I run the migration scripts
- **Then** the `scholarships` table should exist
- **And** it should have core columns:
    - `id` (UUID, Primary Key)
    - `name` (Text, Not Null)
    - `source_url` (Text, Not Null, Unique)
    - `status` (Enum: DRAFT, SUBMITTED, VERIFIED, DEPRECATED, ARCHIVED)
    - `deadline_at` (Timestamp, Nullable)
    - `health_score` (Integer, Default 100)
    - `last_verified_at` (Timestamp)
    - `created_at` (Timestamp, Default now())
    - `updated_at` (Timestamp)
- **And** it should have a JSONB column `data` for flexible fields

### 2. Status Enum
- **Given** the database initialization
- **When** checking types
- **Then** a postgres enum type `scholarship_status` should exist with values: 'DRAFT', 'SUBMITTED', 'VERIFIED', 'DEPRECATED', 'ARCHIVED'

### 3. RLS Policies (Row Level Security)
- **Given** the `scholarships` table
- **When** checking security policies
- **Then** RLS should be enabled
- **And** a policy "Public Read" should allow `SELECT` for `anon` and `authenticated` roles
- **And** a policy "Admin Write" should allow `INSERT/UPDATE/DELETE` only for users with `app_metadata.role = 'admin'` or specific service role

## Tasks

- [x] Initialize Supabase project configuration (config.toml)
- [x] Create migration file `001_create_scholarships_table.sql`
- [x] Implement `scholarship_status` enum type
- [x] Implement `scholarships` table structure with Core + JSONB columns
- [x] Enable RLS on `scholarships` table
- [x] Create RLS policies for Public Read (SELECT)
- [x] Create RLS policies for Admin Write (INSERT/UPDATE)
- [x] Write DB test to verify schema and constraints (using pgTAP or logic verification script)
- [x] Implement automated RLS policy verification script (tests/db/test_rls_policies.sql)

## Dev Notes

### Architecture Guidance
- **Stack:** Supabase (PostgreSQL 15+).
- **Tooling:** Use Supabase CLI for migrations.
- **Conventions:** Snake_case for DB columns.
- **Security:** RLS is mandatory. Never expose write access to public.

### Technical Specifications
- **JSONB Usage:** The `data` column will store variable criteria (e.g., `min_gpa`, `eligible_countries`, `study_levels`). Do not over-normalize these into separate tables for V1.
- **Indexes:** Create an index on `source_url` (for unicity checks) and `status` (for filtering).

## Dev Agent Record

### Implementation Plan
1.  Initialize Supabase structure (`config.toml`).
2.  Create a comprehensive SQL migration file covering:
    *   Enum type `scholarship_status`.
    *   Table `scholarships` with JSONB.
    *   Indexes.
    *   RLS activation and policies.
3.  Add a verification SQL script in `tests/db`.
4.  Implement robust RLS policy tests.

### Completion Notes
- **Supabase Config:** Created `supabase/config.toml` with default ports.
- **Database Schema:** Created `supabase/migrations/20260117000000_create_scholarships_table.sql`.
    - Columns: `id`, `name`, `source_url`, `status`, `deadline_at`, `health_score`, `data` (JSONB).
    - Enum: `DRAFT`, `SUBMITTED`, `VERIFIED`, `DEPRECATED`, `ARCHIVED`.
    - RLS: Enabled. Policies `Public Read Access` (all) and `Admin Write Access` (role check).
- **Testing:** 
    - Added `tests/db/test_schema.sql` for basic schema structure check.
    - Added `tests/db/test_rls_policies.sql` for adversarial RLS testing (Anon Read, Anon Write Fail, Admin Write Success).

## File List
- supabase/config.toml
- supabase/migrations/20260117000000_create_scholarships_table.sql
- tests/db/test_schema.sql
- tests/db/test_rls_policies.sql

## Change Log
- **[2026-01-17]:** Story created.
- **[2026-01-18]:** Implemented database schema and configuration.
- **[2026-01-20]:** Added comprehensive RLS policy tests following code review.


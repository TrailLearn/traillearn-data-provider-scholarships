# Story 1.2: Seed Data Injection

**Status:** ready-for-dev
**Epic:** Epic 1: The Data Foundation & Public Access

## User Story

**As a** Developer,
**I want** to insert a representative set of scholarship data,
**So that** I can verify the hybrid data model handles various real-world scenarios and facilitate frontend development.

## Acceptance Criteria

### 1. Quantity & Diversity
- **Given** the seed script execution
- **When** I query the `scholarships` table
- **Then** I should see exactly 5 records
- **And** they should cover diverse types:
    1. Merit-based (High GPA)
    2. Needs-based (Low Income)
    3. International Mobility (Study in France)
    4. Research Grant (PhD level)
    5. Arts/Sports specific

### 2. JSONB Complexity
- **Given** the inserted records
- **When** I inspect the `data` column
- **Then** I should see rich criteria structures (e.g., nested `eligibility`, arrays for `countries`)
- **And** `amount_min` and `amount_max` should be consistent with the description

### 3. Verification Status
- **Given** the seed data
- **Then** all 5 records should have `status = 'VERIFIED'`
- **And** `last_verified_at` should be set to the current timestamp

## Tasks

- [x] Create `supabase/seed.sql` file
- [x] Define Scholarship 1: "Merit Excellence 2026" (High GPA, USA)
- [x] Define Scholarship 2: "Global Mobility Grant" (Study in France, Open to all)
- [x] Define Scholarship 3: "Women in Tech Initiative" (Gender specific, Engineering)
- [x] Define Scholarship 4: "Future Researchers" (PhD, Stipend)
- [x] Define Scholarship 5: "Creative Arts Fund" (Portfolio required)
- [x] Create `docs/deployment_guide.md` with explicit commands to push schema and seed to a free Supabase project

## Dev Notes

### Technical Specifications
- **File Location:** `supabase/seed.sql` is the standard path for Supabase local development (`supabase start`).
- **Idempotency:** The seed script usually runs after `db reset`. If running manually, ensure no ID conflicts (let Postgres generate UUIDs or use hardcoded known UUIDs if referencing relationally - here no relations yet).
- **JSONB Schema Hint:**
  ```json
  {
    "eligibility": {
      "gpa": 3.5,
      "gender": "female",
      "fields": ["Computer Science", "Data Science"]
    },
    "requirements": ["Essay", "Recommendation Letter"]
  }
  ```

## Dev Agent Record

### Implementation Plan
1.  Generate rich SQL insert statements for `supabase/seed.sql`.
2.  Cover 5 distinct archetypes to validate the flexibility of the JSONB column.
3.  Write a clear documentation guide (`docs/deployment_guide.md`) for remote deployment.

### Completion Notes
- **Seed Data:** Created `supabase/seed.sql` with 5 diverse records (Merit, Mobility, Diversity, Research, Arts).
- **JSONB Validation:** Used realistic structures for `eligibility`, `requirements` and `tags` within the SQL insert.
- **Documentation:** Created `docs/deployment_guide.md` explaining `supabase link`, `db push` and how to execute the seed script remotely.

## File List
- supabase/seed.sql
- docs/deployment_guide.md

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented seed data and documentation.
- **[2026-01-18]:** Updated deployment guide to use `npx supabase` commands.

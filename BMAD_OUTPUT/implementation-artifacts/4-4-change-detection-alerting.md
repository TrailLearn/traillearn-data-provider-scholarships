# Story 4.4: Change Detection Alerting

**Status:** ready-for-dev
**Epic:** Epic 4: The Watchdog & Automation (Intelligence)

## User Story

**As a** Admin,
**I want** to know when a source page has significantly changed,
**So that** I can verify if our data is still accurate.

## Acceptance Criteria

### 1. Content Hashing
- **Given** a successful worker check (200 OK)
- **When** the page content is downloaded
- **Then** a hash (SHA-256) of the **text content** (stripped of dynamic scripts/ads if possible) should be computed
- **And** stored in `url_checks` or `scholarship_metadata`

### 2. Diff Detection
- **Given** a new hash vs previous hash
- **When** they differ
- **Then** calculate a diff percentage (approximate) or simply flag "CHANGED"
- **If** the change is "Significant" (definition to TBD, e.g., > 10% size change or key phrase missing)
- **Then** create an `ALERT` task in Review Queue

## Tasks

- [ ] Add `content_hash` column to `scholarships` or tracking table
- [ ] Implement text extraction (simple HTML tag stripping) in Edge Function
- [ ] Implement hashing logic
- [ ] Define "Significant Change" heuristic (e.g., hash mismatch + size diff > 10%)
- [ ] Hook into Review Queue creation for alerts

## Dev Notes

### Technical Challenges
- **False Positives:** Dynamic content (CSRF tokens, ads, timestamps) changes every request. We must sanitize HTML before hashing.
- **Simplification:** For V1, just hashing the `<body>` length or specific metadata tags might be enough.

## Dev Agent Record

### Implementation Plan
- TBD

### Completion Notes
- TBD

## File List
- TBD

## Change Log
- **[2026-01-20]:** Story created.

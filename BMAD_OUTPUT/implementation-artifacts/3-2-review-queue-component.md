# Story 3.2: Review Queue Component
**Status:** ready-for-dev
**Epic:** Epic 3: The Trust Audit Loop (Admin Operations)

## User Story
**As an** Admin,
**I want** a prioritized list of tasks,
**So that** I can focus on critical data changes first.

## Acceptance Criteria
### 1. Data Loading
- **Given** the Review Queue
- **When** the page loads
- **Then** it must fetch items with status `SUBMITTED` or `ALERT` from the API.

### 2. Item Display
- **Then** each item should show: Name, Source Domain, Time Ago, and a mini Trust Health Badge.

### 3. Selection
- **When** I click an item
- **Then** it should be highlighted as "Active" and its details should load in the Side Panel.

## Tasks
- [ ] Create `ReviewQueueItem` component based on UX specs
- [ ] Create `ReviewQueue` list container with Shadcn `ScrollArea`
- [ ] Fetch pending tasks from `/api/v1/scholarships` (filter by status)
- [ ] Handle empty state ("Inbox Zero")

## Dev Notes
- **API Call:** Use `GET /api/v1/scholarships?status=SUBMITTED` (and another for alerts).
- **UX Hint:** Use `framer-motion` for smooth list entry/exit if possible.

## Dev Agent Record
### Implementation Plan
[To be filled by Dev Agent]
### Completion Notes
[To be filled by Dev Agent]

## File List
[To be filled by Dev Agent]

## Change Log
- **[2026-01-18]:** Story created.

# Story 3.6: Optimistic UI & Shortcuts
**Status:** ready-for-dev
**Epic:** Epic 3: The Trust Audit Loop (Admin Operations)

## User Story
**As a** Power User,
**I want** to navigate the queue with my keyboard,
**So that** I can reach a "Flow State" during audit sessions.

## Acceptance Criteria
### 1. Navigation Shortcuts
- **When** I press `j` or `k`
- **Then** the selection should move to the next/previous item.

### 2. Action Shortcuts
- **When** I press `v` (Validate) or `r` (Reject)
- **Then** the action should trigger immediately.

### 3. Optimistic UI
- **When** an action is triggered
- **Then** the item should disappear from the queue immediately before the API response.

## Tasks
- [ ] Integrate a hotkey library (e.g., `react-use-hotkeys`)
- [ ] Map `j`, `k`, `v`, `r`, `e`, `/`
- [ ] Implement Optimistic UI updates in React state

## Dev Notes
- **Shortcuts:** Ensure shortcuts are disabled when an input is focused (Edit mode).

## Dev Agent Record
### Implementation Plan
[To be filled by Dev Agent]
### Completion Notes
[To be filled by Dev Agent]

## File List
[To be filled by Dev Agent]

## Change Log
- **[2026-01-18]:** Story created.

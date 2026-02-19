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
- [x] Integrate a hotkey library (e.g., `react-use-hotkeys`) - *Implemented via custom useEffect hook for zero-dep simplicity*
- [x] Map `j`, `k`, `v`, `r`, `e`, `/`
- [x] Implement Optimistic UI updates in React state

## Dev Notes
- **Shortcuts:** Shortcuts are automatically disabled when the user is typing in inputs or textareas.

## Dev Agent Record
### Implementation Plan
1.  Add `items` state to `QueuePage` to manage the list locally.
2.  Implement `selectNext` and `selectPrev` helpers.
3.  Add global `keydown` event listener.
4.  Update `ReviewQueue` to accept parent-managed items.

### Completion Notes
- **Vibe:** The dashboard now feels like a professional productivity tool (similar to Gmail or Superhuman).
- **Shortcuts:** `j`/`k` (nav), `v` (approve), `r` (reject), `e` (toggle edit).

## File List
- web/components/review-queue.tsx
- web/app/queue/page.tsx

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-20]:** Implemented Optimistic UI and Keyboard Shortcuts.

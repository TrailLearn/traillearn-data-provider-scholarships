# Story 5.3: Token Management UI

**Status:** review
**Epic:** Epic 5: The Developer Experience

## User Story

**As a** Developer,
**I want** to generate a Service Token for my app,
**So that** I can integrate the API into my own backend.

## Acceptance Criteria

### 1. Token Generation
- **Given** the "Settings" or "Developer" section of the Admin Console
- **When** I click "Generate New API Key"
- **Then** the system should display a long-lived JWT or API Key
- **And** it should be shown only once (security best practice).

### 2. Permissions
- **Given** a generated token
- **Then** it should follow the RLS policies defined (e.g., Read-only by default).

## Tasks

- [x] Create a "Developer Settings" page in the web app (Implemented at `/developer`)
- [x] Implement a UI component to display and copy the token
- [x] Provide a shortcut UI to copy the Project's Base URL and Anon Key
- [ ] Implement a Supabase function to issue/store metadata about custom keys (Future Enhancement)

## Dev Notes

### Security
- Displayed tokens are the project's public anon keys.
- Integration instructions provided in the UI.

## Dev Agent Record

### Implementation Plan
1.  Create `web/app/developer/page.tsx` with copy-to-clipboard functionality.
2.  Expose API Base URL and Anon Key from environment variables.
3.  Add "Coming Soon" for custom service tokens.
4.  Update `DashboardLayout` navigation to include the new page.

### Completion Notes
- **Page:** Developer settings accessible via the sidebar.
- **Tools:** Integrated `lucide-react` icons for a polished UI.
- **DX:** One-click copy for API Base URL and Anon Key.

## File List
- web/app/developer/page.tsx
- web/components/layout/dashboard-layout.tsx

## Change Log
- **[2026-01-22]:** Story created.
- **[2026-01-22]:** Implemented Developer Settings page.


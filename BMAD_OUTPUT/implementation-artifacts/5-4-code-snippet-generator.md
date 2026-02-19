# Story 5.4: Code Snippet Generator

**Status:** review
**Epic:** Epic 5: The Developer Experience

## User Story

**As a** Developer,
**I want** copy-pasteable code for my language,
**So that** I can integrate the API in seconds.

## Acceptance Criteria

### 1. Code Generation
- **Given** a selected endpoint in the Try-It-Out console
- **When** I look at the "Request" section
- **Then** I should see tabs for "Curl", "JavaScript (Fetch)", and "Python".

### 2. Contextual Data
- **Given** I entered specific parameters (e.g., `id=123`)
- **Then** the code snippets should include these parameters in the URL or body.

## Tasks

- [x] Enable the `requestSnippetsEnabled` plugin in Swagger UI
- [x] Verify that snippets include the correct headers (Content-Type, etc.)

## Dev Notes

### Technical Specifications
- Swagger UI configured with `requestSnippetsEnabled={true}` in `web/app/docs/page.tsx`.

## Dev Agent Record

### Implementation Plan
1.  Update the Swagger UI component configuration.
2.  Test that snippets (Curl, Node.js, etc.) are visible in the "Try it out" section.

### Completion Notes
- **Feature:** Developers can now copy ready-to-use code snippets directly from the documentation.

## File List
- web/app/docs/page.tsx

## Change Log
- **[2026-01-22]:** Story created.
- **[2026-01-22]:** Enabled code snippets in API documentation.


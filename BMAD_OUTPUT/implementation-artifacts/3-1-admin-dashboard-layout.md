# Story 3.1: Admin Dashboard Layout
**Status:** ready-for-dev
**Epic:** Epic 3: The Trust Audit Loop (Admin Operations)

## User Story
**As an** Admin (Sarah),
**I want** a high-density dashboard layout,
**So that** I can see my task queue and audit details side-by-side without context switching.

## Acceptance Criteria
### 1. Three-Column Structure
- **Given** the Admin application
- **When** viewed on a desktop (>= 1280px)
- **Then** I should see a fixed sidebar, a scrollable Review Queue (middle), and a large Detail Panel (right).

### 2. UI Foundation (Shadcn/ui)
- **Given** the frontend project
- **Then** it must use Tailwind CSS and the Shadcn/ui "Slate" theme.
- **And** support Dark Mode natively.

### 3. Navigation
- **Given** the Sidebar
- **Then** it must contain links to: "Review Queue", "API Explorer", and "Settings".

## Tasks
- [x] Initialize Next.js/React project with Tailwind + Shadcn/ui
- [x] Create the Main Layout component with three-column responsive grid
- [x] Implement Sidebar navigation
- [x] Implement Dark/Light mode toggle
- [x] Configure global "Inter" font and "JetBrains Mono" for technical data

## Dev Notes
- **Stack:** Next.js (App Router), Tailwind, Shadcn/ui.
- **Layout Principle:** `h-screen overflow-hidden` on main container to ensure internal scrolling columns.

## Dev Agent Record
### Implementation Plan
1.  Scaffold `web` directory structure.
2.  Create `package.json` and config.
3.  Implement `DashboardLayout` with Sidebar.
4.  Add `ThemeToggle` and `ThemeProvider`.
5.  Update Deployment Guide for Vercel.

### Completion Notes
- **Frontend:** Initialized in `web/`.
- **Layout:** `DashboardLayout` implements the Sidebar + Main structure.
- **Components:** Added `Button` (Shadcn stub) and `ThemeToggle`.
- **Docs:** Updated `deployment_guide.md` with Vercel instructions.

## File List
- web/package.json
- web/app/layout.tsx
- web/components/layout/dashboard-layout.tsx
- web/components/theme-provider.tsx
- web/components/ui/button.tsx
- docs/deployment_guide.md
- web/components/layout/dashboard-layout.test.tsx

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-20]:** Implemented Admin Dashboard Layout and Vercel docs.

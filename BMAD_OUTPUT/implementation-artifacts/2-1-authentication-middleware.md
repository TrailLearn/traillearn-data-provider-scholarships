# Story 2.1: Authentication Middleware

**Status:** ready-for-dev
**Epic:** Epic 2: The Secure Gatekeeper (Ingestion)

## User Story

**As a** System Architect,
**I want** to secure all write endpoints with JWT validation,
**So that** only authorized users and services can modify data.

## Acceptance Criteria

### 1. Token Verification
- **Given** a request to a protected endpoint
- **When** the request header contains a valid Supabase JWT
- **Then** the request should be allowed to proceed
- **And** the user context (ID, Role) should be available to the handler

### 2. Missing Token
- **Given** a request without `Authorization` header
- **When** it hits a protected endpoint
- **Then** it should return 401 Unauthorized immediately

### 3. Invalid Token
- **Given** a request with an expired or tampered token
- **When** it hits a protected endpoint
- **Then** it should return 401 Unauthorized

### 4. Shared Module
- **Given** multiple functions needing auth (Submission, Admin actions)
- **Then** the validation logic should be a reusable shared module (DRY principle)

## Tasks

- [x] Create `supabase/functions/_shared/auth.ts`
- [x] Implement `validateUser(req)` function
- [x] Logic: Extract header, verify with Supabase `getUser()` (or simple JWT decode if performant/trusted, but `getUser` checks revocation)
- [x] Return User object or throw 401 Error
- [x] Create a dummy protected function `test-auth` to verify the middleware
- [x] Write logic test in `tests/unit/auth_test.js` (mocking the JWT structure)

## Dev Notes

### Technical Specifications
- **Supabase Auth:** The standard way to verify a token in Edge Functions is creating a client with the user's token:
  ```typescript
  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  ```
- **Performance:** `getUser()` makes a network call to Supabase Auth API. For high throughput, we might consider verifying the JWT signature locally using a library like `djwt` and the JWT Secret, but for V1 `getUser()` is safer (revocation check). Let's stick to `getUser()` for maximum security ("Secure Gatekeeper").

## Dev Agent Record

### Implementation Plan
1.  Create `_shared/auth.ts` module.
2.  Implement `validateUser` using `supabase.auth.getUser()`.
3.  Create `test-auth` function to smoke test the middleware.
4.  Verify logic with Node.js mock test.

### Completion Notes
- **Middleware:** Implemented in `_shared/auth.ts`.
- **Validation:** Relies on Supabase Auth (network call) for security.
- **Testing:** `tests/unit/auth_mock_test.js` passes.

## File List
- supabase/functions/_shared/auth.ts
- supabase/functions/test-auth/index.ts
- tests/unit/auth_mock_test.js

## Change Log
- **[2026-01-18]:** Story created.
- **[2026-01-18]:** Implemented Auth Middleware.

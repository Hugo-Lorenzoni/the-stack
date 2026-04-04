# Implementation Plan: Production Logging

## Overview

Introduce production-grade structured logging using pino and the wide events pattern. Tasks proceed from infrastructure setup through core library creation, middleware extension, API route instrumentation, SSR page instrumentation, utility function updates, console.log removal, and finally testing.

## Tasks

- [x] 1. Install dependencies
  - Run `npm install pino pino-pretty` and `npm install --save-dev @types/pino fast-check`
  - Verify `pino` and `pino-pretty` appear in `package.json` dependencies
  - _Requirements: 1.1, 1.6_

- [x] 2. Extend environment schema
  - [x] 2.1 Add logging env vars to `src/lib/env.ts` Zod schema
    - Add `LOG_LEVEL`, `SERVICE_NAME`, `SERVICE_VERSION`, `COMMIT_SHA` as `z.string().optional()` fields to `EnvSchema`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 2.2 Write property test for env schema validation
    - **Property 1: Optional logging env vars never cause Zod parse failure when absent**
    - **Validates: Requirements 8.5**

- [x] 3. Create `src/lib/logger.ts`
  - [x] 3.1 Implement the pino singleton
    - Export a single `logger` instance configured with `level` from `LOG_LEVEL` env var (default `'info'`)
    - Set `base` fields: `service`, `version`, `commit_hash`, `node_version`, `environment` from env vars with documented defaults
    - Use `formatters.level` to emit `level` as a string label
    - Conditionally apply `pino-pretty` transport when `NODE_ENV === 'development'`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 3.2 Write unit tests for `logger.ts`
    - Verify all base fields (`service`, `version`, `commit_hash`, `node_version`, `environment`) are present in emitted JSON
    - Verify pino-pretty transport is applied when `NODE_ENV` is `'development'`
    - _Requirements: 1.4, 1.6_

  - [x] 3.3 Write property test for logger base fields
    - **Property 2: Every emitted log object contains all five environment context fields with non-empty string values**
    - **Validates: Requirements 1.4, 6.1**

- [ ] 4. Extend `src/middleware.ts` with request ID injection
  - [x] 4.1 Inject `x-request-id` header while preserving `withAuth` logic
    - Read `x-request-id` from the incoming request headers
    - Generate a `crypto.randomUUID()` fallback when the header is absent
    - Call `NextResponse.next()` and set `x-request-id` on the response headers before returning
    - Keep all existing `authorized` callback logic unchanged
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.2 Write unit tests for middleware
    - Verify `x-request-id` is set on the response when absent from the incoming request
    - Verify an existing `x-request-id` header value is preserved (not overwritten)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.3 Write property test for request ID injection
    - **Property 3: For any incoming request, the response always carries an `x-request-id` header that is a valid UUID v4**
    - **Validates: Requirements 2.2, 2.3**

- [ ] 5. Create `src/lib/withLogging.ts`
  - [x] 5.1 Implement the `withLogging` HOF
    - Export `WideEvent` type alias (`Record<string, unknown>`)
    - Accept a `RouteHandler` and return a new handler with identical signature
    - Initialise `wideEvent` with `request_id`, `timestamp`, `method`, `path` before calling the handler
    - Resolve session via `getNextAuthSession()` and set `wideEvent.user` to `{ id, role }` or `null`
    - Pass `wideEvent` to the handler via the context object
    - On success: set `wideEvent.status_code` and `wideEvent.outcome`
    - On thrown error: set `outcome: 'error'`, `status_code: 500`, `error: { message, type }`, re-throw
    - In `finally`: set `wideEvent.duration_ms` and call `logger.info(wideEvent)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 5.2 Write unit tests for `withLogging`
    - Test wide event fields for a successful handler (outcome, status_code, duration_ms, user)
    - Test wide event fields when the handler throws (outcome: 'error', error.message, error.type)
    - Test that `wideEvent.user` is `null` when no session is present
    - _Requirements: 3.5, 3.6, 3.8, 3.9_

  - [x] 5.3 Write property test: wide event always emitted
    - **Property 4: `withLogging` always calls `logger.info` exactly once per invocation, regardless of whether the handler succeeds or throws**
    - **Validates: Requirements 3.7**

  - [x] 5.4 Write property test: duration_ms is non-negative
    - **Property 5: `wideEvent.duration_ms` is always a non-negative integer**
    - **Validates: Requirements 3.3, 6.1**

  - [x] 5.5 Write property test: error serialisation
    - **Property 6: When a handler throws any value, `wideEvent.error` is always `{ message: string, type: string }` with no raw Error objects**
    - **Validates: Requirements 3.6, 6.7**

- [ ] 6. Create `src/lib/getRequestLogger.ts`
  - [x] 6.1 Implement the `getRequestLogger` async helper
    - Accept a `page` string parameter
    - Read `x-request-id` from Next.js `headers()` API; fall back to `crypto.randomUUID()`
    - Initialise `wideEvent` with `request_id`, `timestamp`, `page`, `render_type: 'ssr'`
    - Return `{ wideEvent, emit, startTime }` where `emit()` sets `duration_ms` and calls `logger.info(wideEvent)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 6.2 Write unit tests for `getRequestLogger`
    - Verify `request_id` is read from the `x-request-id` header when present
    - Verify a UUID fallback is generated when the header is absent
    - Verify `emit()` sets `duration_ms` to a non-negative value
    - _Requirements: 4.2, 4.3, 4.5_

  - [x] 6.3 Write property test: SSR emit always sets duration_ms
    - **Property 7: `emit()` always sets `wideEvent.duration_ms` to a value ≥ 0 before calling `logger.info`**
    - **Validates: Requirements 4.5, 6.1**

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Update utility functions in `src/utils/` to accept optional `wideEvent`
  - [x] 8.1 Update `getEvents.ts`
    - Add optional `wideEvent?: Record<string, unknown>` parameter
    - When provided, write `wideEvent.get_events = { duration_ms, count, page, type }` after the query
    - Replace the `timedPromise` / `console.log` timing pattern with structured wideEvent writes
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 8.2 Update `getEventsCount.ts`
    - Add optional `wideEvent` parameter
    - When provided, write `wideEvent.get_events_count = { duration_ms, count, type }`
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 8.3 Update `getInfos.ts`
    - Add optional `wideEvent` parameter to `getInfos`
    - When provided, write `wideEvent.get_infos = { duration_ms, cache_hit }` 
    - Replace `console.log('[INFO] Fetched infos...')` and `timedPromise` with structured wideEvent writes
    - Replace `console.log('[INFO] Refreshing infos.json data...')` in the `after()` callback with `logger.info({ action: 'cache_refresh', resource: 'infos.json', outcome: 'started' })`
    - Add completion log in `after()` callback: `logger.info({ action: 'cache_refresh', resource: 'infos.json', outcome: 'completed', duration_ms })`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 8.4 Update remaining utility functions that have `console.log` calls
    - Update `getAdminEvents.ts`, `getAdminSearchedEvents.ts`, `getSearchedEvents.ts`, and any other utils with timing or debug logs
    - Add optional `wideEvent` parameter; write structured sub-objects when provided
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 8.5 Write property test: utility wideEvent mutation
    - **Property 8: When a utility function is called with a `wideEvent`, it always writes a sub-object with a numeric `duration_ms` field ≥ 0**
    - **Validates: Requirements 5.2**

  - [x] 8.6 Write property test: utility backward compatibility
    - **Property 9: When a utility function is called without a `wideEvent`, the return value is identical to calling it with `wideEvent` provided (no side effects on return value)**
    - **Validates: Requirements 5.3**

- [x] 9. Update admin API route handlers to use `withLogging`
  - [x] 9.1 Update `src/app/api/admin/acceptuser/route.ts`
    - Wrap handler with `withLogging`; set `wideEvent.action = 'accept_user'`; allowlist body fields; remove `console.log`
    - _Requirements: 3.1, 9.1, 10.4_

  - [x] 9.2 Update `src/app/api/admin/rejectuser/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'reject_user'`; allowlist body fields; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.3 Update `src/app/api/admin/user/route.ts`
    - Wrap with `withLogging`; set appropriate `action` and `resource`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.4 Update `src/app/api/admin/event/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action` and `wideEvent.resource`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.5 Update `src/app/api/admin/addphotos/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'add_photos'`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.6 Update `src/app/api/admin/deletephoto/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'delete_photo'`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.7 Update `src/app/api/admin/deleteevent/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'delete_event'`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.8 Update `src/app/api/admin/publishevent/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'publish_event'`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.9 Update `src/app/api/admin/changecover/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'change_cover'`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.10 Update `src/app/api/admin/downloadallpictures/[id]/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'download_all_pictures'`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.11 Update `src/app/api/admin/newvideo/route.ts` and `deletevideo/route.ts`
    - Wrap both with `withLogging`; set appropriate `action` fields; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.12 Update `src/app/api/admin/newsponsor/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'new_sponsor'`; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.13 Update `src/app/api/admin/modificationcomite/route.ts` and `modificationtextintro/route.ts`
    - Wrap both with `withLogging`; set appropriate `action` fields; remove `console.log`
    - _Requirements: 3.1, 9.1_

  - [x] 9.14 Update `src/app/api/admin/video/route.ts` and `event/update/` and `event/photo/` routes
    - Wrap with `withLogging`; set appropriate `action` and `resource` fields; remove `console.log`
    - _Requirements: 3.1, 9.1_

- [x] 10. Update public API route handlers to use `withLogging`
  - [x] 10.1 Update `src/app/api/register/route.ts`
    - Wrap with `withLogging`; set `wideEvent.registration = { role, cercle }` (allowlist only — no name, email, password); remove `console.log(body.name, body.surname)`
    - _Requirements: 3.1, 9.1, 10.1, 10.3, 10.4_

  - [x] 10.2 Update `src/app/api/login/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'login'`; never log credentials; remove `console.log`
    - _Requirements: 3.1, 9.1, 10.1_

  - [x] 10.3 Update `src/app/api/search/route.ts`
    - Wrap with `withLogging`; set `wideEvent.action = 'search'`, `wideEvent.result_count`; remove commented-out `console.log` lines
    - _Requirements: 3.1, 9.1_

  - [x] 10.4 Update `src/app/api/forgot-password/route.ts` and `reset-password/route.ts`
    - Wrap both with `withLogging`; set `action` fields; never log email or token; remove `console.log`
    - _Requirements: 3.1, 9.1, 10.1_

  - [x] 10.5 Update `src/app/api/passwordcheck/[id]/route.ts`, `comite/route.ts`, and `text-intro/route.ts`
    - Wrap each with `withLogging`; set appropriate `action` fields; remove `console.log`
    - _Requirements: 3.1, 9.1_

- [x] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Update SSR pages to use `getRequestLogger`
  - [x] 12.1 Update `src/app/events/page.tsx`
    - Call `getRequestLogger('/events')` at the top; wrap data fetching in `try/finally`; pass `wideEvent` to `getEvents` and `getEventsCount`; set `outcome`, `event_count`, `pagination` on success; set `outcome: 'error'` and `error` on failure; call `emit()` in `finally`
    - Remove all commented-out `// console.log(...)` lines
    - _Requirements: 4.1, 4.4, 4.6, 4.7, 4.8, 9.3_

  - [x] 12.2 Update `src/app/fpmsevents/page.tsx`
    - Same pattern as 12.1 for the BAPTISE event type page
    - _Requirements: 4.1, 4.4, 4.6, 4.7, 4.8_

  - [x] 12.3 Update `src/app/autresevents/page.tsx`
    - Same pattern as 12.1 for the AUTRE event type page
    - _Requirements: 4.1, 4.4, 4.6, 4.7, 4.8_

  - [x] 12.4 Update `src/app/search/page.tsx`
    - Call `getRequestLogger('/search')`; wrap data fetching; set `wideEvent.query` (search term) and `result_count`; call `emit()` in `finally`
    - Remove commented-out `console.log` lines
    - _Requirements: 4.1, 4.4, 4.6, 4.7, 4.8_

  - [x] 12.5 Update `src/app/videos/page.tsx`
    - Call `getRequestLogger('/videos')`; wrap data fetching; set `outcome` and `video_count`; call `emit()` in `finally`
    - _Requirements: 4.1, 4.4, 4.6, 4.7, 4.8_

  - [x] 12.6 Update `src/app/admin/(dashboard)/page.tsx`
    - Call `getRequestLogger('/admin')`; pass `wideEvent` to `getInfos`; set `outcome`; call `emit()` in `finally`
    - _Requirements: 4.1, 4.4, 4.6, 4.7, 4.8_

  - [x] 12.7 Update remaining admin SSR pages
    - Apply `getRequestLogger` to `accounts-approval/page.tsx`, `accounts-management/page.tsx`, `events-management/page.tsx`, `drafted-events/page.tsx`, `videos-management/page.tsx`, `sponsors-management/page.tsx`, `comite/page.tsx`, `text-intro/page.tsx`, `folder-size/page.tsx`
    - Each page: call `getRequestLogger`, wrap data fetch in `try/finally`, set `outcome`, call `emit()`
    - Remove any commented-out `console.log` lines
    - _Requirements: 4.1, 4.4, 4.6, 4.7, 4.8, 9.3_

- [x] 13. Update `getInfos.ts` background cache refresh to use logger directly
  - Replace `console.log('[INFO] Refreshing infos.json data...')` with `logger.info({ action: 'cache_refresh', resource: 'infos.json', outcome: 'started' })`
  - Add `logger.info({ action: 'cache_refresh', resource: 'infos.json', outcome: 'completed', duration_ms })` after `writeFile`
  - Replace `timedPromise` wrapper and its internal `console.log` with structured timing written to `wideEvent` or logged directly
  - _Requirements: 5.5, 5.6, 9.2_

- [x] 14. Remove all remaining `console.log` calls
  - [x] 14.1 Audit and remove `console.log` in `src/app/api/`
    - Verify no `console.log` calls remain in any route handler after tasks 9 and 10
    - _Requirements: 9.1_

  - [x] 14.2 Audit and remove `console.log` in `src/utils/`
    - Verify no `console.log` calls remain after tasks 8 and 13
    - _Requirements: 9.2_

  - [x] 14.3 Remove commented-out `// console.log(...)` lines in `src/app/`
    - Delete all `// console.log(...)` comments in SSR pages (events, fpmsevents, autresevents, search, admin pages)
    - Where the logged data is relevant, ensure it is already captured in the `wideEvent` instead
    - _Requirements: 9.3_

- [x] 15. Write property-based tests for correctness properties
  - [x] 15.1 Write property test: request_id is always a valid UUID
    - **Property 10: For any wide event emitted by `withLogging` or `getRequestLogger`, `request_id` matches the UUID v4 regex pattern**
    - **Validates: Requirements 2.2, 3.2, 4.2, 6.1**

  - [x] 15.2 Write property test: outcome is always 'success' or 'error'
    - **Property 11: `wideEvent.outcome` is always exactly `'success'` or `'error'`, never any other value or undefined**
    - **Validates: Requirements 3.5, 3.6, 4.7, 4.8, 6.1**

  - [x] 15.3 Write property test: no PII in wide events
    - **Property 12: A wide event object never contains keys `email`, `password`, `name`, or `surname` at any nesting level**
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [x] 15.4 Write property test: error field is always serialised
    - **Property 13: When `wideEvent.error` is set, it is always a plain object `{ message: string, type: string }` and never a raw Error instance or undefined**
    - **Validates: Requirements 3.6, 6.5, 6.7, 9.4**

- [x] 16. Write unit tests for all logging components
  - [x] 16.1 Write unit tests for `withLogging` integration scenarios
    - Test a successful handler: verify `outcome: 'success'`, `status_code`, `duration_ms ≥ 0`, `user` fields
    - Test a throwing handler: verify `outcome: 'error'`, `status_code: 500`, `error.message`, `error.type`, and that the error is re-thrown
    - Test with no session: verify `user: null`
    - _Requirements: 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 16.2 Write unit tests for `getRequestLogger`
    - Verify `request_id` equals the `x-request-id` header value when present
    - Verify `request_id` is a UUID when header is absent
    - Verify `render_type: 'ssr'` and `page` are set correctly
    - Verify `emit()` sets `duration_ms` and calls `logger.info` once
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 16.3 Write unit tests for utility function wideEvent integration
    - Verify `getEvents` writes `wideEvent.get_events` sub-object with `duration_ms`, `count`, `page`, `type` when `wideEvent` is provided
    - Verify `getEventsCount` writes `wideEvent.get_events_count` sub-object when `wideEvent` is provided
    - Verify `getInfos` writes `wideEvent.get_infos` sub-object with `duration_ms` and `cache_hit` when `wideEvent` is provided
    - Verify no mutation occurs when `wideEvent` is not provided
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
- The `uuid` package is not needed — use `crypto.randomUUID()` which is available in Node.js 14.17+ and the Next.js edge runtime
- Never spread request bodies onto `wideEvent`; always explicitly allowlist fields to avoid PII leakage

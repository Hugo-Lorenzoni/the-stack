# Requirements Document

## Introduction

This feature introduces production-grade structured logging to the Next.js 15 application using the wide events (canonical log lines) pattern. The application currently has scattered `console.log()` calls across API routes, SSR async server components, and server utility functions, with no structured logging, no request correlation, and no environment context.

The logging system will use **pino** as the single logger instance, emit one context-rich JSON event per request (wide event) in a `finally` block, and cover all server-side execution paths: API route handlers, SSR async server components, server utility functions, and Next.js middleware. Every event will carry a unique `request_id` for correlation, business context (user ID, role, action), and environment characteristics (commit hash, Node.js version, environment name).

Because Next.js App Router does not support traditional middleware-based context injection into React Server Components, the system uses two complementary patterns:
- A `withLogging` higher-order function wrapping API route handlers
- A `getRequestLogger()` helper that SSR pages and utility functions call to obtain a contextual logger enriched from Next.js `headers()`

The existing `src/middleware.ts` (which wraps `withAuth`) will be extended to inject a `x-request-id` header on every matched request so that all downstream server-side code can read a stable request ID.

---

## Glossary

- **Logger**: The single pino logger instance exported from `src/lib/logger.ts`, configured once at application startup.
- **Wide_Event**: A single structured JSON object built throughout a request's lifecycle and emitted once in a `finally` block via the Logger.
- **Request_ID**: A UUID v4 string uniquely identifying one HTTP request, injected by the Middleware and propagated via the `x-request-id` header.
- **withLogging**: A higher-order function that wraps a Next.js API route handler, initialises a Wide_Event, manages timing, and emits the event in a `finally` block.
- **getRequestLogger**: A server-side helper function that reads `x-request-id` from Next.js `headers()` and returns a contextual object used to build a Wide_Event in SSR pages and utility functions.
- **Middleware**: The Next.js middleware at `src/middleware.ts` that wraps `withAuth` and injects `x-request-id` on every matched request.
- **SSR_Page**: An async React Server Component (e.g. `src/app/events/page.tsx`) that renders on the server and may call utility functions.
- **Utility_Function**: A server-side function in `src/utils/` (e.g. `getEvents`, `getInfos`, `getEventsCount`) that performs database queries or file I/O.
- **API_Route**: A Next.js Route Handler in `src/app/api/` that handles HTTP requests.
- **Log_Level**: One of `trace`, `debug`, `info`, `warn`, `error`, or `fatal`, in ascending severity order.
- **Environment_Context**: A fixed set of fields captured at process startup: `service`, `version`, `commit_hash`, `node_version`, `environment`.
- **Business_Context**: Request-scoped fields describing the acting user and the resource being operated on (e.g. `user.id`, `user.role`, `action`, `resource`).

---

## Requirements

### Requirement 1: Single Logger Instance

**User Story:** As a developer, I want a single, centrally configured logger so that all server-side code emits consistently formatted, structured JSON logs without duplicating configuration.

#### Acceptance Criteria

1. THE Logger SHALL be a pino logger instance exported from `src/lib/logger.ts` and imported by all other modules that need to emit logs.
2. THE Logger SHALL be configured with a minimum log level read from the `LOG_LEVEL` environment variable, defaulting to `info` when the variable is absent.
3. THE Logger SHALL support the following log levels in ascending severity order: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
4. THE Logger SHALL automatically include Environment_Context fields (`service`, `version`, `commit_hash`, `node_version`, `environment`) in every emitted event by reading them from environment variables at startup.
5. THE Logger SHALL emit every event as a single-line JSON object to `stdout`.
6. IF the `NODE_ENV` environment variable equals `development`, THEN THE Logger SHALL emit human-readable pretty-printed output instead of single-line JSON.
7. THE Logger SHALL never emit unstructured string messages; every call MUST pass a structured object as the first argument.

---

### Requirement 2: Request ID Injection via Middleware

**User Story:** As a developer, I want every matched HTTP request to carry a unique request ID so that all log events from the same request can be correlated.

#### Acceptance Criteria

1. WHEN a request matches the middleware `config.matcher` patterns, THE Middleware SHALL read the `x-request-id` header from the incoming request.
2. IF the incoming request does not contain an `x-request-id` header, THEN THE Middleware SHALL generate a new UUID v4 and set it as the value of `x-request-id`.
3. THE Middleware SHALL forward the `x-request-id` header on the `NextResponse` so that downstream handlers and server components can read it via `headers()`.
4. THE Middleware SHALL preserve all existing `withAuth` authorization logic without modification.
5. THE Middleware SHALL add the `x-request-id` header before the `withAuth` callback executes so that the Request_ID is available to all subsequent server-side code within the same request.

---

### Requirement 3: API Route Logging via `withLogging` Wrapper

**User Story:** As a developer, I want API route handlers to automatically emit one Wide_Event per request so that every API call is observable without manually adding logging boilerplate to each route.

#### Acceptance Criteria

1. THE withLogging SHALL accept a Next.js route handler function and return a new handler function with identical signature.
2. WHEN a wrapped handler is invoked, THE withLogging SHALL initialise a Wide_Event containing: `request_id`, `method`, `path`, `timestamp`, and all Environment_Context fields.
3. THE withLogging SHALL record the start time before invoking the wrapped handler and set `duration_ms` on the Wide_Event in the `finally` block.
4. THE withLogging SHALL make the Wide_Event object available to the wrapped handler so that the handler can enrich it with Business_Context.
5. WHEN the wrapped handler completes successfully, THE withLogging SHALL set `outcome` to `"success"` and `status_code` to the HTTP response status on the Wide_Event.
6. IF the wrapped handler throws an error, THEN THE withLogging SHALL set `outcome` to `"error"`, `status_code` to `500`, and `error` to an object containing `message` and `type` fields on the Wide_Event.
7. THE withLogging SHALL emit the Wide_Event via the Logger at `info` level in the `finally` block, regardless of whether the handler succeeded or threw.
8. THE withLogging SHALL extract the authenticated user's `id` and `role` from the NextAuth session and include them under a `user` field on the Wide_Event when a session is present.
9. IF no session is present, THEN THE withLogging SHALL set `user` to `null` on the Wide_Event without throwing.

---

### Requirement 4: SSR Page Logging via `getRequestLogger`

**User Story:** As a developer, I want async server components to emit one Wide_Event per render so that SSR page loads are observable with the same structure as API route logs.

#### Acceptance Criteria

1. THE getRequestLogger SHALL be an async function callable from any async server component or server utility function.
2. WHEN called, THE getRequestLogger SHALL read the `x-request-id` header from the Next.js `headers()` API and include it as `request_id` in the returned context object.
3. IF the `x-request-id` header is absent, THEN THE getRequestLogger SHALL generate a new UUID v4 as the fallback `request_id`.
4. THE getRequestLogger SHALL return an object containing: a `wideEvent` record for accumulating context, an `emit` function that logs the Wide_Event via the Logger at `info` level, and a `startTime` timestamp.
5. WHEN an SSR_Page calls `emit`, THE getRequestLogger SHALL set `duration_ms` to the elapsed time since `startTime` before emitting.
6. THE SSR_Page SHALL call `emit` in a `try/finally` block so that the Wide_Event is emitted even when data-fetching throws.
7. IF data-fetching in an SSR_Page throws an error, THEN THE SSR_Page SHALL set `outcome` to `"error"` and `error.message` on the Wide_Event before the `finally` block emits it.
8. WHEN an SSR_Page renders successfully, THE SSR_Page SHALL set `outcome` to `"success"` and include relevant Business_Context (e.g. `page`, `event_count`, `pagination`) on the Wide_Event.

---

### Requirement 5: Utility Function Logging

**User Story:** As a developer, I want server utility functions to contribute timing and result context to the caller's Wide_Event so that slow database queries and cache operations are visible without emitting separate log lines.

#### Acceptance Criteria

1. THE Utility_Function SHALL accept an optional `wideEvent` parameter of type `Record<string, unknown>`.
2. WHEN a `wideEvent` parameter is provided, THE Utility_Function SHALL write its timing and result metadata (e.g. `duration_ms`, row count, cache hit/miss) into a named sub-object on the provided `wideEvent` rather than emitting a separate log event.
3. WHEN no `wideEvent` parameter is provided, THE Utility_Function SHALL operate without logging, preserving backward compatibility with call sites that do not yet pass a Wide_Event.
4. THE Utility_Function SHALL replace all existing `console.log` timing statements (e.g. `[TIMER]`, `[INFO]`) with structured writes to the `wideEvent` parameter.
5. WHEN `getInfos` triggers a background cache refresh via `after()`, THE getInfos SHALL log a structured `info` event via the Logger indicating the cache refresh started, including `action: "cache_refresh"` and `resource: "infos.json"`.
6. WHEN `getInfos` completes a background cache refresh, THE getInfos SHALL log a structured `info` event via the Logger indicating completion, including `duration_ms` for the refresh operation.

---

### Requirement 6: Wide Event Schema

**User Story:** As a developer, I want all Wide_Events to follow a consistent JSON schema so that logs are queryable with predictable field names across all server-side contexts.

#### Acceptance Criteria

1. THE Wide_Event SHALL always contain the following top-level fields: `request_id`, `timestamp`, `duration_ms`, `outcome`, `service`, `environment`, `node_version`.
2. THE Wide_Event SHALL always contain a `user` field that is either `null` (unauthenticated) or an object with at minimum `id` and `role` sub-fields.
3. WHEN the Wide_Event represents an API route invocation, THE Wide_Event SHALL additionally contain `method`, `path`, and `status_code`.
4. WHEN the Wide_Event represents an SSR page render, THE Wide_Event SHALL additionally contain `page` (the route path string) and `render_type: "ssr"`.
5. IF an error occurred during the request, THEN THE Wide_Event SHALL contain an `error` object with `message` (string) and `type` (string) sub-fields.
6. THE Wide_Event SHALL use `snake_case` for all field names.
7. THE Wide_Event SHALL never contain raw `Error` objects, `undefined` values, or circular references; all error information SHALL be serialised to plain strings before being set on the Wide_Event.
8. WHERE optional Business_Context is available (e.g. `event_id`, `action`, `resource`), THE Wide_Event SHALL include it as named sub-objects or top-level fields using consistent names defined in this document.

---

### Requirement 7: Log Levels and Severity Usage

**User Story:** As a developer, I want a clear convention for which log level to use in each situation so that log noise is minimised in production while retaining full detail in development.

#### Acceptance Criteria

1. THE Logger SHALL be used at `info` level for all Wide_Events emitted at the end of a successful or expected-error request lifecycle.
2. THE Logger SHALL be used at `warn` level for recoverable anomalies that do not fail the request but indicate a potential problem (e.g. cache miss forcing a cold fetch, deprecated API usage, missing optional configuration).
3. THE Logger SHALL be used at `error` level for unexpected failures that cause a request to return a 5xx status or an unhandled exception to propagate.
4. THE Logger SHALL be used at `fatal` level for process-level failures that require immediate operator attention and likely cause the process to exit (e.g. database connection failure at startup, missing required environment variable).
5. THE Logger SHALL be used at `debug` level for verbose diagnostic information useful during development or targeted production investigation, which SHALL be suppressed when `LOG_LEVEL` is `info` or higher.
6. THE Logger SHALL be used at `trace` level for the most granular diagnostic output (e.g. individual SQL query parameters), which SHALL be suppressed when `LOG_LEVEL` is `debug` or higher.
7. THE Logger SHALL NOT be called with unstructured string messages at any level; every log call SHALL pass a structured object.

---

### Requirement 8: Environment Variable Configuration

**User Story:** As a developer, I want all logging-related configuration to be driven by environment variables so that log behaviour can be changed per deployment without code changes.

#### Acceptance Criteria

1. THE Logger SHALL read `LOG_LEVEL` from the environment to set the minimum log level, defaulting to `info`.
2. THE Logger SHALL read `SERVICE_NAME` from the environment to populate the `service` field, defaulting to `"cpv-app"`.
3. THE Logger SHALL read `SERVICE_VERSION` from the environment to populate the `version` field, defaulting to the `version` field in `package.json`.
4. THE Logger SHALL read `COMMIT_SHA` from the environment to populate the `commit_hash` field, defaulting to `"unknown"` when absent.
5. THE `src/lib/env.ts` Zod schema SHALL be extended to declare `LOG_LEVEL`, `SERVICE_NAME`, `SERVICE_VERSION`, and `COMMIT_SHA` as optional string environment variables so that they are validated at startup.
6. IF a required logging environment variable is missing and has no default, THEN THE application SHALL log a `fatal` event and refuse to start.

---

### Requirement 9: Removal of Unstructured `console.log` Calls

**User Story:** As a developer, I want all existing `console.log` calls on the server side to be replaced by structured logger calls or Wide_Event field assignments so that no unstructured output reaches production logs.

#### Acceptance Criteria

1. THE system SHALL replace every `console.log` call in `src/app/api/` with either a structured Logger call at the appropriate level or a field assignment on the active Wide_Event.
2. THE system SHALL replace every `console.log` call in `src/utils/` with either a structured Logger call at the appropriate level or a field assignment on the `wideEvent` parameter.
3. THE system SHALL remove or replace every commented-out `// console.log(...)` line in SSR pages (`src/app/`) with a corresponding Wide_Event field assignment where the data is relevant, or delete the comment entirely where it is not.
4. WHEN replacing a `console.log(error)` call in a `catch` block, THE system SHALL instead set `wideEvent.error` to `{ message: error.message, type: error.name }` and emit the Wide_Event at `error` level.
5. WHEN replacing a `console.log` timing statement (e.g. `[TIMER]`, `[INFO]`), THE system SHALL instead write the timing value as a numeric `duration_ms` field on the Wide_Event or a named sub-object thereof.

---

### Requirement 10: No Sensitive Data in Logs

**User Story:** As a developer, I want the logging system to never emit sensitive user data so that logs are safe to store and share without privacy or security risk.

#### Acceptance Criteria

1. THE Logger SHALL never include plaintext passwords, password hashes, or authentication tokens in any Wide_Event or log call.
2. THE Logger SHALL never include full credit card numbers, social security numbers, or other PII beyond what is explicitly listed as permitted (user ID, user role).
3. WHEN logging user registration or authentication events, THE Wide_Event SHALL include `user.id` and `user.role` but SHALL NOT include `user.email`, `user.name`, `user.surname`, or `user.password`.
4. IF a Wide_Event field is derived from a request body that may contain sensitive fields, THEN THE withLogging or handler SHALL explicitly allowlist the fields written to the Wide_Event rather than spreading the entire body.


# UniHostel — AI Engineering & Quality Standards

This document establishes mandatory engineering rules for all AI coding agents working on the UniHostel codebase.

---

## Part 1: Production-Ready Enforcement Standards

### 1. Fail Safely
- No single unhandled error should crash the entire application.
- Every API error is caught and returns a clear, non-technical message via `sendServerError()`. Never leak stack traces, database credentials, or file paths in production.
- Frontend React errors are caught gracefully by `<ErrorBoundary>` with user recovery options.

### 2. Structured, Queryable Logging
- All backend logs are written in JSON via Winston (`backend/config/logger.js`).
- Every entry includes: `timestamp`, `level`, `message`, and metadata.
- Sensitive credentials (passwords, JWTs, tokens, MFA codes, card details) are automatically redacted before logging.
- In containerized production (Render, Docker, Railway), logs are streamed to stdout in JSON format for automated ingestion.

### 3. Error Tracking & Centralized Ingestion
- Global process handlers catch `uncaughtException` and `unhandledRejection` and shut down cleanly.
- Errors are structured so third-party log forwarders (Sentry, Better Stack, Datadog) can ingest them seamlessly without reformatting.

### 4. Input Validation & Security
- Every user input is validated before processing.
- NoSQL sanitization (`express-mongo-sanitize`), Parameter Pollution prevention (`hpp`), Cloudflare Turnstile, and file upload validations (`backend/middleware/imageValidation.js`) must remain active.

### 5. Rollback-Ready Deployment
- Use soft deletion (`isDeleted: true`, `deletedAt`, `deletedBy`) for data models.
- All schema additions must be backward-compatible and additive (optional fields with safe defaults).

### 6. Automated Testing
- Maintain automated unit, integration, smoke, pentest, and load tests in `backend/tests/`.
- Ensure tests pass before deploying.

---

## Part 2: Scalability & Performance Standards

### 1. Database Query Discipline & Indexing
- Never write unindexed or unbounded queries.
- Every query on a growing collection must utilize compound indexes and explicit `.limit()` or pagination.
- Avoid N+1 queries by using `.populate()` or MongoDB `$group` aggregation pipelines.

### 2. Caching Strategy
- Use TTL caching (`backend/services/cache.js`) for public listings and expensive aggregations.
- Enforce memory caps (`maxKeys`) on in-memory caches to prevent memory leaks.
- Invalidate cache by pattern on creation/update/deletion.

### 3. Non-Blocking Async Processing
- Any heavy, non-critical operation (such as transactional email delivery or notifications) must run via `setImmediate()` or background jobs after the HTTP response has dispatched.

### 4. Rate Limiting & Abuse Prevention
- Global IP rate limiting on all `/api/` endpoints.
- Tightened rate limits on authentication (`/api/auth/login`, `/api/auth/register`), waitlist submissions (`/api/waitlist`), and search queries (`/api/hostels`).

### 5. Timeouts & Graceful Degradation
- All external HTTP calls (e.g. Paystack payments) must have strict timeout thresholds (15s–30s).
- Database connection pools must be configured with timeouts and auto-reconnect listeners.

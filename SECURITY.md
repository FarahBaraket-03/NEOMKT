# Security Overview

This document explains how the GraphQL API is secured in this project.

## Scope

The controls below apply mainly to:
- `apps/api` (Apollo GraphQL API)
- `supabase/migration` (database and RLS policies)

## Security Controls Implemented

### 1) Authentication (HTTP and WebSocket)

How it works:
- Bearer tokens are extracted from HTTP headers and validated with Supabase auth.
- For WebSocket subscriptions, tokens are accepted from `authorization`, `Authorization`, `token`, `accessToken`, or nested `headers`.
- The GraphQL context is built with the authenticated user when a valid token is present.

Where:
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/lib/context.ts`

### 2) Authorization (Role-based and Ownership)

How it works:
- `requireAuth` blocks unauthenticated requests for protected resolvers.
- `requireAdmin` blocks non-admin access for admin-only operations.
- `requireOwnership` ensures users can only modify their own resources (unless admin).

Where:
- `apps/api/src/utils/authorization.ts`
- Used across resolvers such as:
  - `apps/api/src/resolvers/review.ts`
  - `apps/api/src/resolvers/wishlist.ts`
  - `apps/api/src/resolvers/subscriptions.ts`

### 3) Query Complexity Guard (DoS Mitigation)

How it works:
- Incoming GraphQL operations are parsed and measured.
- Requests are rejected if they exceed:
  - max depth: `8`
  - max field count: `250`
- Introspection operations are detected and bypass this specific guard.

Where:
- `apps/api/src/index.ts`

### 4) Rate Limiting (Abuse Protection)

How it works:
- General API request limiter on all routes:
  - `100` requests per `15` minutes per IP.
- Mutation-specific limiter on `/graphql`:
  - `10` mutation requests per `15` minutes per IP.
- Additional business rate limit for review submission:
  - max `3` reviews per hour per user.

Where:
- `apps/api/src/index.ts`
- `apps/api/src/resolvers/review.ts`

### 5) Input Validation and Sanitization

How it works:
- Resolver inputs are validated with dedicated validators before database writes.
- Review text is sanitized with `sanitize-html` (no tags allowed) and control characters are removed.

Where:
- `apps/api/src/validators/`
- `apps/api/src/resolvers/review.ts`

### 6) Database-Level Enforcement (Supabase RLS)

How it works:
- Row Level Security policies enforce access at the database layer.
- Public read policies exist for catalog data.
- Writes to catalog entities are restricted to `service_role`.
- Review policies enforce authenticated ownership.
- User policies prevent self role escalation.

Where:
- `supabase/migration/20240004_security_rls_hardening.sql`

### 7) Introspection and GraphQL Landing Page Controls

How it works:
- GraphQL introspection is controlled by `GRAPHQL_INTROSPECTION` env var.
- Landing page is enabled in development and disabled in production.

Where:
- `apps/api/src/lib/env.ts`
- `apps/api/src/index.ts`

## Operational Security Notes

- Secrets are loaded via environment variables and are required at startup.
- API errors are logged with operation/user context (without exposing auth tokens in resolver logic).
- Keep service-role keys private and never expose them to the frontend.

## Recommended Production Hardening

These are recommended practices for production deployment:
- Set `NODE_ENV=production`.
- Set `GRAPHQL_INTROSPECTION=false` unless you explicitly need runtime introspection.
- Restrict CORS origins instead of using the default open `cors()` policy.
- Add central monitoring/alerting for rate-limit spikes and auth failures.
- Rotate Supabase keys and JWT secrets periodically.

## Reporting Security Issues

If you discover a security vulnerability, report it privately to the maintainers and avoid creating a public issue with exploit details.

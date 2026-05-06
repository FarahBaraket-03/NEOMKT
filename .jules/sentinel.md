## 2025-05-15 - Missing Validation in Administrative Mutations
**Vulnerability:** Administrative mutations (specifically ProductSpec) were missing input validation and sanitization, allowing potentially malicious content (XSS) or oversized payloads (DoS) to be stored in the database.
**Learning:** While the `adminMutation` wrapper handles authorization, it does not automatically provide input validation or sanitization. Security layers must be explicitly integrated into every mutation resolver.
**Prevention:** Always implement a dedicated validator for each entity and use centralized sanitization utilities for all user-controllable text fields before database persistence.

## 2024-06-05 - Inconsistent Validation of Secondary Entity Fields
**Vulnerability:** While primary fields (name, slug) were validated, secondary fields like URLs (`logoUrl`, `imageUrl`), `country`, and `icon` lacked validation, exposing the app to XSS (via `javascript:` URIs) and DoS (via oversized strings).
**Learning:** Security validation must be comprehensive. Attackers will target "forgotten" fields that aren't core to the primary business logic but are still rendered in the UI or stored in the DB.
**Prevention:** Audit all input interfaces for text-based fields and ensure every field has a length limit and, where applicable, format validation (e.g., URL protocol checks).

## 2024-10-30 - Query Complexity Guard Bypass via Introspection
**Vulnerability:** The GraphQL query complexity guard was being bypassed by adding any introspection field (e.g., `__schema`) to a query. The guard's logic used `.some()` to detect introspection and would skip the entire complexity check if found, allowing an attacker to bundle a malicious high-complexity query with a single introspection field.
**Learning:** Security middleware that "skips" checks based on input content must be extremely careful not to allow partial bypasses. It is safer to filter or ignore specific fields within the security logic rather than bypassing the entire check.
**Prevention:** Instead of bypassing complexity guards for introspection queries, modify the complexity calculator to ignore introspection fields (`__schema`, `__type`, `__typename`) while still enforcing limits on the rest of the query.

## 2025-05-20 - GraphQL Middleware Bypass via GET Requests
**Vulnerability:** GraphQL security middleware (complexity guards, mutation rate limiters) was only processing `req.body`, allowing attackers to bypass these protections by sending operations via GET request query parameters (`?query=...`).
**Learning:** Apollo Server and other GraphQL servers often support both POST (body) and GET (query string) requests. Security logic that only inspects the request body is incomplete and easily bypassed.
**Prevention:** Centralize GraphQL operation extraction into a utility that inspects both `req.body` and `req.query`, and ensure all security middleware uses this utility to evaluate every incoming operation regardless of HTTP method.

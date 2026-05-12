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

## 2026-05-12 - Unauthorized Disclosure of Inventory Metrics
**Vulnerability:** The `lowStockProductsCount` query was accessible to unauthenticated users, leaking sensitive business intelligence regarding inventory levels and potential supply chain gaps.
**Learning:** Queries that aggregate or reveal internal status (even if they don't return full entity rows) must be evaluated for business impact. Aggregated data can be as sensitive as individual records.
**Prevention:** Default to `requireAdmin(ctx)` for any query that provides metrics, counts of restricted statuses, or administrative telemetry.

## 2026-05-12 - Wishlist Resource Exhaustion & Spam
**Vulnerability:** The `addToWishlist` mutation lacked rate limiting, allowing an authenticated user to programmatically fill their wishlist (or many users to automate wishlist spam), leading to potential DB bloat or DoS.
**Learning:** Any mutation that creates a record in the database should have a rate limit proportionate to expected human usage, especially for "low-stakes" actions like wishlisting which might be overlooked compared to reviews.
**Prevention:** Implement sliding-window rate limiting in the resolver for all non-idempotent mutations, using a centralized pattern like `enforceReviewSubmissionRateLimit`.

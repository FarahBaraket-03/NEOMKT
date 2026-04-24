## 2025-05-15 - Missing Validation in Administrative Mutations
**Vulnerability:** Administrative mutations (specifically ProductSpec) were missing input validation and sanitization, allowing potentially malicious content (XSS) or oversized payloads (DoS) to be stored in the database.
**Learning:** While the `adminMutation` wrapper handles authorization, it does not automatically provide input validation or sanitization. Security layers must be explicitly integrated into every mutation resolver.
**Prevention:** Always implement a dedicated validator for each entity and use centralized sanitization utilities for all user-controllable text fields before database persistence.

## 2024-06-05 - Inconsistent Validation of Secondary Entity Fields
**Vulnerability:** While primary fields (name, slug) were validated, secondary fields like URLs (`logoUrl`, `imageUrl`), `country`, and `icon` lacked validation, exposing the app to XSS (via `javascript:` URIs) and DoS (via oversized strings).
**Learning:** Security validation must be comprehensive. Attackers will target "forgotten" fields that aren't core to the primary business logic but are still rendered in the UI or stored in the DB.
**Prevention:** Audit all input interfaces for text-based fields and ensure every field has a length limit and, where applicable, format validation (e.g., URL protocol checks).

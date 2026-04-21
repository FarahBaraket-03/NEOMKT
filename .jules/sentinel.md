## 2025-05-15 - Missing Validation in Administrative Mutations
**Vulnerability:** Administrative mutations (specifically ProductSpec) were missing input validation and sanitization, allowing potentially malicious content (XSS) or oversized payloads (DoS) to be stored in the database.
**Learning:** While the `adminMutation` wrapper handles authorization, it does not automatically provide input validation or sanitization. Security layers must be explicitly integrated into every mutation resolver.
**Prevention:** Always implement a dedicated validator for each entity and use centralized sanitization utilities for all user-controllable text fields before database persistence.

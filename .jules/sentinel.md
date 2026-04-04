# Sentinel's Journal - CRITICAL SECURITY LEARNINGS

## 2025-05-15 - GraphQL Complexity Guard Bypass via Mixed Queries
**Vulnerability:** The GraphQL complexity guard was designed to skip introspection queries (to allow IDEs and tools to work). However, it used a `some` logic: if *any* field was an introspection field (`__schema` or `__type`), the *entire* query was exempted from depth and field count limits.
**Learning:** Attackers can bypass resource-exhaustion protections by mixing a single introspection field into a deeply nested or wide malicious query.
**Prevention:** Introspection query detection must be strict. An operation should only be exempted if **all** of its fields are introspection-related (`__schema`, `__type`, `__typename`). If any regular field is present, the entire operation must be subject to complexity analysis.

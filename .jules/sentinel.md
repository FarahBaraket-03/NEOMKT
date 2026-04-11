## 2026-04-11 - [Input Validation Inconsistencies]
**Vulnerability:** Inconsistent input validation and missing sanitization across various entities (Brand, Category).
**Learning:** While some entities like Product and Review had validation and sanitization, others like Category had none, and Brand was missing description validation. Sanitization was also missing for some string fields that are likely rendered in the UI.
**Prevention:** Implement a consistent validation and sanitization layer for all user-controllable inputs at the resolver level.

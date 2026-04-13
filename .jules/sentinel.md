## 2024-05-22 - Inconsistent input validation and sanitization across resolvers
**Vulnerability:** Category mutations (createCategory, updateCategory) were missing backend validation and HTML sanitization, unlike Product and Review mutations, potentially allowing XSS or data integrity issues.
**Learning:** Security controls (sanitization/validation) were inconsistently applied across different resolvers, likely due to oversight during the addition of new entities.
**Prevention:** Implement a standard "Security Checklist" for new GraphQL mutations and use shared validation utilities to ensure consistent coverage across all entities.

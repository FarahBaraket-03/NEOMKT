import { describe, expect, it } from 'vitest';
import { isIntrospectionQuery, getQueryMetrics } from '../../src/index.js';

describe('GraphQL Security Guard', () => {
  it('identifies pure introspection queries correctly', () => {
    const query = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
          }
        }
      }
    `;
    expect(isIntrospectionQuery(query)).toBe(true);
  });

  it('identifies non-introspection queries correctly', () => {
    const query = `
      query GetProducts {
        products {
          id
          name
        }
      }
    `;
    expect(isIntrospectionQuery(query)).toBe(false);
  });

  it('correctly identifies mixed queries as non-introspection (fixed)', () => {
    // This query contains both introspection AND regular data.
    // The guard should NOT skip it, so isIntrospectionQuery should be false.
    const mixedQuery = `
      query MixedQuery {
        __schema {
          queryType { name }
        }
        products {
          id
          name
          reviews {
            id
            user {
              id
              username
            }
          }
        }
      }
    `;

    // We expect this to return false in the FIXED version
    expect(isIntrospectionQuery(mixedQuery)).toBe(false);
  });

  it('calculates query depth and field count accurately', () => {
    const deepQuery = `
      query DeepQuery {
        products { # Depth 1
          brand { # Depth 2
            products { # Depth 3
              category { # Depth 4
                name
              }
            }
          }
        }
      }
    `;

    const metrics = getQueryMetrics(deepQuery);
    expect(metrics).not.toBeNull();
    if (metrics) {
      expect(metrics.maxDepth).toBe(5);
      expect(metrics.fieldCount).toBe(5); // products, brand, products, category, name
    }
  });
});

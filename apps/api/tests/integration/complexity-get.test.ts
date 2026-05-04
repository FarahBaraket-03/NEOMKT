import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Query Complexity Guard GET Bypass', () => {
  it('should block a deep query via GET', async () => {
    const deepQuery = `
      query Deep {
        products {
          category {
            products {
              category {
                products {
                  category {
                    products {
                      category {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await request(app)
      .get('/graphql')
      .set('apollo-require-preflight', 'true')
      .query({ query: deepQuery, operationName: 'Deep' });

    // Currently this is expected to FAIL because the complexity guard
    // only checks req.body and doesn't account for GET queries.
    // If it bypasses the guard, Apollo might still reject it if it's too complex or if it fails other checks,
    // but we want our custom guard to catch it.
    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });
});

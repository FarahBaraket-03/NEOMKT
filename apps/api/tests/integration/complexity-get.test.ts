import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Query Complexity Guard GET Bypass', () => {
  it('should block a deep query sent via GET', async () => {
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

    // This should be 400 if the complexity guard is working for GET requests.
    // If it's vulnerable, it will likely be 200 (or 400 from Apollo if introspection is disabled,
    // but the complexity guard should trigger first).
    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });
});

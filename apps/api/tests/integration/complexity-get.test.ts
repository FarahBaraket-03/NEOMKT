import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('GraphQL GET Request Complexity Bypass', () => {
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

    // If vulnerable, it will return 200 (or 400 with a different error if something else is wrong).
    // If fixed, it should return 400 with the complexity error.
    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });
});

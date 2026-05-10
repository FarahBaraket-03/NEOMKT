import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Query Complexity Guard for GET requests', () => {
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
      .query({ query: deepQuery, operationName: 'Deep' });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });
});

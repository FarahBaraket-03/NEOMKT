import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Query Complexity Guard GET Bypass', () => {
  it('should block a deep query via POST', async () => {
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
      .post('/graphql')
      .set('apollo-require-preflight', 'true')
      .send({ query: deepQuery, operationName: 'Deep' });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });

  it('should ALSO block a deep query via GET', async () => {
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

    // If vulnerable, this will NOT be 400 (it might be 200 or another error, but not 400 from complexity guard)
    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });
});

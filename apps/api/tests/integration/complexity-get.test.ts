import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Query Complexity Guard GET Bypass', () => {
  it('should block a deep query sent via POST', async () => {
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
      .send({ query: deepQuery, operationName: 'Deep' });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });

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

    // CURRENTLY THIS FAILS because the guard only looks at req.body
    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });
});

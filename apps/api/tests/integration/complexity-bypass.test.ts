import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Query Complexity Guard Bypass', () => {
  it('should block a deep query', async () => {
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

  it('should NOT be bypassed by adding an introspection field', async () => {
    const bypassedQuery = `
      query Bypassed {
        __schema { queryType { name } }
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
      .send({ query: bypassedQuery, operationName: 'Bypassed' });

    // If vulnerable, this might return 200 (or some other error if the query itself is invalid,
    // but the complexity guard should have caught it first)
    // We expect it to be blocked by the complexity guard.
    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('exceeds maximum 8');
  });
});

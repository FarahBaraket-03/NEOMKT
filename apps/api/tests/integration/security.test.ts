import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Security Headers', () => {
  it('should have security headers', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });
});

describe('Authorization: lowStockProductsCount', () => {
  it('should deny access to unauthenticated users', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: 'query { lowStockProductsCount }',
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Authentication is required');
    expect(response.body.errors[0].extensions?.code).toBe('UNAUTHENTICATED');
  });
});

describe('Query Complexity Guard: Introspection Bypass', () => {
  it('should block mixed queries that exceed complexity limits', async () => {
    // A query with many fields to exceed MAX_QUERY_FIELD_COUNT (250)
    const manyFields = Array.from({ length: 260 }, (_, i) => `f${i}: __typename`).join('\n');
    const mixedQuery = `
      query Mixed {
        __schema { types { name } }
        ${manyFields}
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .send({
        query: mixedQuery,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatch(/exceeds maximum 250/);
  });

  it('should allow pure introspection queries', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: 'query { __schema { queryType { name } } }',
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
  });
});

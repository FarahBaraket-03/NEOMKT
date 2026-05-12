import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('lowStockProductsCount authorization', () => {
  it('should block unauthenticated access to lowStockProductsCount', async () => {
    const query = `
      query GetLowStockProductsCount($threshold: Int) {
        lowStockProductsCount(threshold: $threshold)
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .send({ query, variables: { threshold: 10 } });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    // It should now be an UNAUTHENTICATED error because requireAdmin calls requireAuth
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});

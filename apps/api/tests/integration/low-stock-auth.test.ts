import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as auth from '../../src/middleware/auth.js';

describe('lowStockProductsCount Authorization', () => {
  it('should return 401 if unauthenticated', async () => {
    const query = `
      query {
        lowStockProductsCount(threshold: 10)
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatch(/Authentication is required/i);
  });

  it('should return 403 if authenticated as a regular user', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      role: 'USER',
    });

    const query = `
      query {
        lowStockProductsCount(threshold: 10)
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatch(/Admin role required/i);
  });
});

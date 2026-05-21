import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as auth from '../../src/middleware/auth.js';

describe('lowStockProductsCount Authorization', () => {
  const query = `
    query {
      lowStockProductsCount(threshold: 10)
    }
  `;

  it('should return error for unauthenticated user', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue(null);

    const response = await request(app)
      .post('/graphql')
      .send({ query });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Authentication is required');
    expect(response.body.errors[0].extensions?.code).toBe('UNAUTHENTICATED');
  });

  it('should return error for regular user', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      role: 'USER',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({ query });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Admin role required');
    expect(response.body.errors[0].extensions?.code).toBe('FORBIDDEN');
  });

  it('should allow admin user', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer admin-token')
      .send({ query });

    // It should not have authentication/authorization errors
    // It might have database errors if Supabase is not mocked, but that's fine for this test
    // as long as it passes the requireAdmin check.
    if (response.body.errors) {
      expect(response.body.errors[0].message).not.toBe('Authentication is required');
      expect(response.body.errors[0].message).not.toBe('Admin role required');
    }
  });
});

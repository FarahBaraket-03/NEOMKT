import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as auth from '../../src/middleware/auth.js';

describe('lowStockProductsCount Authorization', () => {
  const query = `
    query LowStock($threshold: Int) {
      lowStockProductsCount(threshold: $threshold)
    }
  `;

  it('should return UNAUTHENTICATED when no token is provided', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('should return FORBIDDEN when user is not an ADMIN', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      role: 'USER',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-user-token')
      .set('apollo-require-preflight', 'true')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toBe('Admin role required');
  });

  it('should return data or database error when user is an ADMIN', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-admin-token')
      .set('apollo-require-preflight', 'true')
      .send({ query });

    expect(response.status).toBe(200);

    // In a test environment without a real Supabase, we might get an INTERNAL_SERVER_ERROR
    // because the database query fails, but that's okay as long as it passed the auth check.
    if (response.body.errors) {
      expect(response.body.errors[0].extensions.code).not.toBe('UNAUTHENTICATED');
      expect(response.body.errors[0].extensions.code).not.toBe('FORBIDDEN');
      // If it reaches the database query, it means auth passed.
      expect(response.body.errors[0].extensions.code).toBe('INTERNAL_SERVER_ERROR');
    } else {
      expect(response.body.data.lowStockProductsCount).toBeDefined();
    }
  });
});

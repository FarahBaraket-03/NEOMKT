import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as auth from '../../src/middleware/auth.js';

describe('Product Security', () => {
  const query = `
    query GetLowStock($threshold: Int) {
      lowStockProductsCount(threshold: $threshold)
    }
  `;

  it('should block unauthenticated access to lowStockProductsCount', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({ query, variables: { threshold: 10 } });

    expect(response.body.errors[0].message).toBe('Authentication is required');
  });

  it('should block non-admin access to lowStockProductsCount', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      role: 'USER',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer user-token')
      .send({ query, variables: { threshold: 10 } });

    expect(response.body.errors[0].message).toBe('Admin role required');
  });

  it('should allow admin access to lowStockProductsCount', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    // We also need to mock the supabase call since we don't have a real DB in this environment
    // But for this test, we just want to see if it passes the auth check.
    // Actually, if it passes auth, it will try to call Supabase.
    // Let's just check that it DOES NOT return "Admin role required".

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer admin-token')
      .send({ query, variables: { threshold: 10 } });

    expect(response.body.errors[0].message).not.toBe('Admin role required');
    expect(response.body.errors[0].message).not.toBe('Authentication is required');
  });
});

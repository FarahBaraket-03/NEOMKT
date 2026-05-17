import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as auth from '../../src/middleware/auth.js';

describe('lowStockProductsCount Authorization', () => {
  const query = `
    query GetLowStockProductsCount($threshold: Int) {
      lowStockProductsCount(threshold: $threshold)
    }
  `;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should block unauthenticated access', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Authentication is required');
  });

  it('should block non-admin access', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'test-user-id',
      email: 'user@example.com',
      role: 'USER',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Admin role required');
  });

  it('should allow admin access', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'test-admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({ query });

    expect(response.status).toBe(200);
    // It still hits the DB and returns "An internal database error occurred"
    // because we didn't mock supabase, but that means it passed the requireAdmin(ctx) check!
    expect(response.body.errors[0].message).toBe('An internal database error occurred');
  });
});

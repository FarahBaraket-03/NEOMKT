import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as auth from '../../src/middleware/auth.js';

describe('lowStockProductsCount Authorization', () => {
  const query = `
    query GetLowStock($threshold: Int) {
      lowStockProductsCount(threshold: $threshold)
    }
  `;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return UNAUTHENTICATED when no user is provided', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue(null);

    const response = await request(app)
      .post('/graphql')
      .send({ query });

    expect(response.body.errors[0].message).toBe('Authentication is required');
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('should return FORBIDDEN when user is NOT an admin', async () => {
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      role: 'USER',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer user-token')
      .send({ query });

    expect(response.body.errors[0].message).toBe('Admin role required');
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });

  it('should allow access when user IS an admin', async () => {
    // We expect a 200 even if database fails later, as long as it passes requireAdmin
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer admin-token')
      .send({ query });

    // If it reaches the resolver, it will try to hit the database.
    // In our test environment with placeholder keys, it might return a database error,
    // but NOT an authentication/authorization error.
    if (response.body.errors) {
       expect(response.body.errors[0].extensions.code).not.toBe('UNAUTHENTICATED');
       expect(response.body.errors[0].extensions.code).not.toBe('FORBIDDEN');
    } else {
       expect(response.status).toBe(200);
    }
  });
});

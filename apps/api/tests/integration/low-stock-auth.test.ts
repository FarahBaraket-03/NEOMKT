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

  it('should block unauthenticated users', async () => {
    // Ensure no user is authenticated
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue(null);

    const response = await request(app)
      .post('/graphql')
      .send({ query, variables: { threshold: 10 } });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Authentication is required');
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('should block non-admin users', async () => {
    // Simulate a regular user
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      role: 'USER',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({ query, variables: { threshold: 10 } });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Admin role required');
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });

  it('should allow admin users', async () => {
    // Simulate an admin user
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer admin-token')
      .send({ query, variables: { threshold: 10 } });

    // It might still fail if the database mock isn't perfect,
    // but it shouldn't be an Authentication or Authorization error.
    if (response.body.errors) {
      expect(response.body.errors[0].message).not.toBe('Authentication is required');
      expect(response.body.errors[0].message).not.toBe('Admin role required');
    } else {
      expect(response.status).toBe(200);
      expect(response.body.data.lowStockProductsCount).toBeDefined();
    }
  });
});

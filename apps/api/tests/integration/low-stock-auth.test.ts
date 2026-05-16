import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as authMiddleware from '../../src/middleware/auth.js';

describe('lowStockProductsCount Authorization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const query = `
    query GetLowStockCount($threshold: Int) {
      lowStockProductsCount(threshold: $threshold)
    }
  `;

  it('should block unauthenticated access to lowStockProductsCount', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query,
        variables: { threshold: 10 },
      });

    expect(response.body.errors).toBeDefined();
    const messages = response.body.errors.map((e: any) => e.message);
    expect(messages).toContain('Authentication is required');
  });

  it('should block regular user access to lowStockProductsCount', async () => {
    vi.spyOn(authMiddleware, 'authenticateToken').mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      role: 'USER',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({
        query,
        variables: { threshold: 10 },
      });

    expect(response.body.errors).toBeDefined();
    const messages = response.body.errors.map((e: any) => e.message);
    expect(messages).toContain('Admin role required');
  });

  it('should allow admin access to lowStockProductsCount', async () => {
    vi.spyOn(authMiddleware, 'authenticateToken').mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer admin-token')
      .send({
        query,
        variables: { threshold: 10 },
      });

    // Should NOT have auth or admin errors
    if (response.body.errors) {
      const messages = response.body.errors.map((e: any) => e.message);
      expect(messages).not.toContain('Authentication is required');
      expect(messages).not.toContain('Admin role required');
    } else {
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('lowStockProductsCount');
    }
  });
});

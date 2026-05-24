import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as auth from '../../src/middleware/auth.js';

describe('Product Security', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('lowStockProductsCount', () => {
    const query = `
      query GetLowStockCount($threshold: Int) {
        lowStockProductsCount(threshold: $threshold)
      }
    `;

    it('should return Authentication Error when not authenticated', async () => {
      vi.spyOn(auth, 'authenticateToken').mockResolvedValue(null);

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', 'Bearer invalid-token')
        .send({ query });

      expect(response.body.errors[0].message).toBe('Authentication is required');
    });

    it('should return Authorization Error for non-admin users', async () => {
      vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        role: 'USER'
      });

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', 'Bearer valid-user-token')
        .send({ query });

      expect(response.body.errors[0].message).toBe('Admin role required');
    });

    it('should allow access for admin users', async () => {
      vi.spyOn(auth, 'authenticateToken').mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN'
      });

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ query });

      expect(response.body.errors?.[0]?.message).not.toBe('Authentication is required');
      expect(response.body.errors?.[0]?.message).not.toBe('Admin role required');
    });
  });
});

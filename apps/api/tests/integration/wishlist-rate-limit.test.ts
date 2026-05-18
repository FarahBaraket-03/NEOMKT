import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as auth from '../../src/middleware/auth.js';
import * as supabaseLib from '../../src/lib/supabase.js';

describe('Wishlist Rate Limiting', () => {
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'USER' as const,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auth, 'authenticateToken').mockResolvedValue(mockUser);
  });

  it('should enforce rate limit for adding items to wishlist', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    };

    // First call to .from('wishlist_items') is to check if it's already in wishlist
    // Second call is to check rate limit

    // Setup for rate limit check (enforceWishlistRateLimit)
    // It calls .from('wishlist_items').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('added_at', windowStart)
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // existing check

    // For the count check, we need to return an object that has 'count' and 'error'
    // But it's awaited: const { count, error } = await query;
    // The query is what's returned by gte()
    mockSupabase.gte.mockResolvedValueOnce({ count: 30, error: null });

    vi.spyOn(supabaseLib, 'createUserClient').mockReturnValue(mockSupabase as any);

    const query = `
      mutation AddToWishlist($productId: ID!) {
        addToWishlist(productId: $productId) {
          id
        }
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .set('apollo-require-preflight', 'true')
      .set('Authorization', 'Bearer valid-token')
      .send({
        query,
        variables: { productId: 'product-1' },
      });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('You can add up to 30 items to your wishlist per hour');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { wishlistResolvers } from '../../src/resolvers/wishlist.js';
import { ValidationError } from '../../src/utils/errors.js';

describe('Wishlist Rate Limiting', () => {
  it('should throw ValidationError when rate limit is exceeded', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'USER' as const };

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    // First call to check existing item: returns null (not wishlisted)
    // Second call to check rate limit: returns count = 20
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'wishlist_items') {
        return {
          select: vi.fn().mockImplementation((_fields, options) => {
             if (options?.count === 'exact') {
                return {
                  eq: vi.fn().mockReturnThis(),
                  gte: vi.fn().mockResolvedValue({ count: 20, error: null }),
                };
             }
             return {
                eq: vi.fn().mockReturnThis(),
                eq2: vi.fn().mockReturnThis(), // handle multiple eq
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
             };
          }),
        };
      }
      return mockSupabase;
    });

    const ctx = {
      supabase: mockSupabase as any,
      user: mockUser,
    } as any;

    const args = { productId: 'prod-123' };

    await expect(wishlistResolvers.Mutation.addToWishlist(null, args, ctx))
      .rejects.toThrow(ValidationError);

    await expect(wishlistResolvers.Mutation.addToWishlist(null, args, ctx))
      .rejects.toThrow(/You can add up to 20 items to your wishlist per hour/);
  });
});

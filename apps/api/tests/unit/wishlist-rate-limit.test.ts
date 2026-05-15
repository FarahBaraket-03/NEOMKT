import { describe, expect, it, vi, beforeEach } from 'vitest';
import { wishlistResolvers } from '../../src/resolvers/wishlist.js';
import { ValidationError } from '../../src/utils/errors.js';
import type { GraphQLContext } from '../../src/types/context.js';

describe('Wishlist Rate Limit', () => {
  let mockCtx: any;

  beforeEach(() => {
    const supabaseMock: any = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    mockCtx = {
      user: { id: 'user-123', email: 'user@example.com', role: 'USER' },
      supabase: supabaseMock,
    };
  });

  it('should throw ValidationError if rate limit exceeded', async () => {
    mockCtx.supabase.select.mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        count: 30,
        error: null,
      }),
    });

    const args = { productId: 'prod-123' };

    await expect(
      wishlistResolvers.Mutation.addToWishlist(null, args, mockCtx as GraphQLContext),
    ).rejects.toThrow(ValidationError);

    await expect(
      wishlistResolvers.Mutation.addToWishlist(null, args, mockCtx as GraphQLContext),
    ).rejects.toThrow(/You can add up to 30 items to your wishlist per hour/);
  });

  it('should allow addition if under rate limit', async () => {
    mockCtx.supabase.select.mockReturnValueOnce({
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        count: 5,
        error: null,
      }),
    });

    // Mock existing check
    mockCtx.supabase.maybeSingle.mockResolvedValue({ data: null, error: null });

    // Mock insert
    mockCtx.supabase.single.mockResolvedValue({
      data: { id: 'wish-1', user_id: 'user-123', product_id: 'prod-123', added_at: new Date().toISOString() },
      error: null,
    });

    const args = { productId: 'prod-123' };

    const result = await wishlistResolvers.Mutation.addToWishlist(null, args, mockCtx as GraphQLContext);
    expect(result).toBeDefined();
    expect(result.productId).toBe('prod-123');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { wishlistResolvers } from '../../src/resolvers/wishlist.js';
import { ValidationError } from '../../src/utils/errors.js';
import type { GraphQLContext } from '../../src/types/context.js';

describe('Wishlist Rate Limiting', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com', role: 'USER' };

  it('allows adding to wishlist when under the rate limit', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'existing-item' }, error: null }),
    };

    // First call to from('wishlist_items') is for rate limiting
    // Second call is for checking existing item
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    } as any).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'existing-item' }, error: null }),
    } as any);

    // Rate limit check
    const rateLimitQuery = {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
    };
    const rateLimitSelect = {
        select: vi.fn().mockReturnValue(rateLimitQuery),
    };

    mockSupabase.from.mockReturnValueOnce(rateLimitSelect as any);

    const ctx = {
      supabase: mockSupabase,
      user: mockUser,
    } as unknown as GraphQLContext;

    await expect(
      wishlistResolvers.Mutation.addToWishlist({}, { productId: 'prod-1' }, ctx)
    ).resolves.toBeDefined();
  });

  it('throws ValidationError when rate limit is exceeded', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 30, error: null }),
          }),
        }),
      }),
    };

    const ctx = {
      supabase: mockSupabase,
      user: mockUser,
    } as unknown as GraphQLContext;

    await expect(
      wishlistResolvers.Mutation.addToWishlist({}, { productId: 'prod-1' }, ctx)
    ).rejects.toThrow(ValidationError);

    await expect(
      wishlistResolvers.Mutation.addToWishlist({}, { productId: 'prod-1' }, ctx)
    ).rejects.toThrow('You can add up to 30 items to your wishlist per hour.');
  });
});

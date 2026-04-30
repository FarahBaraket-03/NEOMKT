import { describe, expect, it, vi } from 'vitest';
import { wishlistResolvers } from '../../src/resolvers/wishlist.js';
import { GraphQLContext } from '../../src/types/context.js';

describe('Wishlist Resolvers Validation', () => {
  const mockCtx = {
    user: { id: 'user-123', role: 'USER' },
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn(),
      delete: vi.fn().mockReturnThis(),
    },
  } as unknown as GraphQLContext;

  describe('isProductWishlisted', () => {
    it('rejects invalid productId UUID', async () => {
      await expect(
        wishlistResolvers.Query.isProductWishlisted(
          null,
          { productId: 'not-a-uuid' },
          mockCtx,
        ),
      ).rejects.toThrow(/Invalid UUID format for productId/);
    });

    it('accepts valid productId UUID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      (mockCtx.supabase.maybeSingle as any).mockResolvedValue({ data: null, error: null });

      await expect(
        wishlistResolvers.Query.isProductWishlisted(
          null,
          { productId: validUuid },
          mockCtx,
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('addToWishlist', () => {
    it('rejects invalid productId UUID', async () => {
      await expect(
        wishlistResolvers.Mutation.addToWishlist(
          null,
          { productId: 'not-a-uuid' },
          mockCtx,
        ),
      ).rejects.toThrow(/Invalid UUID format for productId/);
    });
  });

  describe('removeFromWishlist', () => {
    it('rejects invalid productId UUID', async () => {
      await expect(
        wishlistResolvers.Mutation.removeFromWishlist(
          null,
          { productId: 'not-a-uuid' },
          mockCtx,
        ),
      ).rejects.toThrow(/Invalid UUID format for productId/);
    });
  });
});

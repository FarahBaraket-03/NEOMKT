import type { GraphQLContext } from '../types/context.js';
import type { WishlistItemRow } from '../lib/models.js';
import { mapWishlistItem } from '../lib/mappers.js';
import { requireAuth } from '../utils/authorization.js';
import { handleDatabaseError, ValidationError } from '../utils/errors.js';

const MAX_WISHLIST_ITEMS_PER_HOUR = 30;
const WISHLIST_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

interface WishlistArgs {
  productId: string;
}

async function enforceWishlistRateLimit(
  ctx: GraphQLContext,
  userId: string,
): Promise<void> {
  const windowStart = new Date(Date.now() - WISHLIST_RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await ctx.supabase
    .from('wishlist_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('added_at', windowStart);

  if (error) {
    handleDatabaseError(error);
  }

  if ((count ?? 0) >= MAX_WISHLIST_ITEMS_PER_HOUR) {
    throw new ValidationError(
      `You can add up to ${MAX_WISHLIST_ITEMS_PER_HOUR} items to your wishlist per hour.`,
    );
  }
}

export const wishlistResolvers = {
  Query: {
    wishlist: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);

      const { data, error } = await ctx.supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        handleDatabaseError(error);
      }

      return (data ?? []).map((row) => mapWishlistItem(row as WishlistItemRow));
    },
    isProductWishlisted: async (
      _parent: unknown,
      args: WishlistArgs,
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) {
        return false;
      }

      const { data, error } = await ctx.supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('product_id', args.productId)
        .maybeSingle();

      if (error) {
        handleDatabaseError(error);
      }

      return Boolean(data);
    },
  },
  Mutation: {
    addToWishlist: async (_parent: unknown, args: WishlistArgs, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);

      const { data: existingData, error: existingError } = await ctx.supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', args.productId)
        .maybeSingle();

      if (existingError) {
        handleDatabaseError(existingError);
      }

      if (existingData) {
        return mapWishlistItem(existingData as WishlistItemRow);
      }

      await enforceWishlistRateLimit(ctx, user.id);

      const { data, error } = await ctx.supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: args.productId,
        })
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      return mapWishlistItem(data as WishlistItemRow);
    },
    removeFromWishlist: async (
      _parent: unknown,
      args: WishlistArgs,
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx);

      const { error } = await ctx.supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', args.productId);

      if (error) {
        handleDatabaseError(error);
      }

      return true;
    },
  },
  WishlistItem: {
    product: (
      wishlistItem: { productId: string },
      _args: unknown,
      ctx: GraphQLContext,
    ) => ctx.dataloaders.productLoader.load(wishlistItem.productId),
  },
};

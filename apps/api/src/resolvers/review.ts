import type { GraphQLContext } from '../types/context.js';
import type { ReviewRow } from '../lib/models.js';
import { mapReview } from '../lib/mappers.js';
import {
  requireAuth,
  requireAdmin,
  requireOwnership,
} from '../utils/authorization.js';
import { handleDatabaseError, ValidationError } from '../utils/errors.js';
import {
  validateCreateReviewInput,
  validateUpdateReviewInput,
} from '../validators/review.js';
import { pubsub } from '../lib/pubsub.js';
import { sanitizeText, sanitizeOptionalText } from '../utils/sanitization.js';

interface CreateReviewInput {
  productId: string;
  rating: number;
  title?: string | null;
  comment: string;
}

interface UpdateReviewInput {
  rating?: number;
  title?: string | null;
  comment?: string;
}

interface DbErrorLike {
  code?: string;
}

const MAX_REVIEWS_PER_HOUR = 3;
const REVIEW_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_REVIEW_PAGE_SIZE = 20;
const MAX_REVIEW_PAGE_SIZE = 100;

interface ReviewPaginationArgs {
  productId?: string;
  limit?: number;
  offset?: number;
}

interface ReviewCountArgs {
  productId?: string;
}

function sanitizeCreateReviewInput(input: CreateReviewInput): CreateReviewInput {
  return {
    ...input,
    title: sanitizeOptionalText(input.title),
    comment: sanitizeText(input.comment),
  };
}

function sanitizeUpdateReviewInput(input: UpdateReviewInput): UpdateReviewInput {
  return {
    ...(input.rating !== undefined ? { rating: input.rating } : {}),
    ...(input.title !== undefined ? { title: sanitizeOptionalText(input.title) } : {}),
    ...(input.comment !== undefined ? { comment: sanitizeText(input.comment) } : {}),
  };
}

async function enforceReviewSubmissionRateLimit(
  ctx: GraphQLContext,
  userId: string,
): Promise<void> {
  const windowStart = new Date(Date.now() - REVIEW_RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await ctx.supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', windowStart);

  if (error) {
    handleDatabaseError(error);
  }

  if ((count ?? 0) >= MAX_REVIEWS_PER_HOUR) {
    throw new ValidationError('You can submit up to 3 reviews per hour.', 'comment');
  }
}

function toDbReviewInput(
  input: CreateReviewInput | UpdateReviewInput,
  userId?: string,
): Record<string, unknown> {
  return {
    ...(userId !== undefined ? { user_id: userId } : {}),
    ...(Object.prototype.hasOwnProperty.call(input, 'productId')
      ? { product_id: (input as CreateReviewInput).productId }
      : {}),
    ...(input.rating !== undefined ? { rating: input.rating } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.comment !== undefined ? { comment: input.comment } : {}),
  };
}

function fallbackUsername(userId: string): string {
  return `user_${userId.replace(/-/g, '').slice(0, 24)}`;
}

async function ensureUserProfileForReview(
  ctx: GraphQLContext,
  user: { id: string; email: string },
): Promise<void> {
  const { data: existingProfile, error: existingProfileError } = await ctx.supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfileError) {
    handleDatabaseError(existingProfileError);
  }

  if (existingProfile) {
    return;
  }

  const email = user.email || `${user.id}@local.invalid`;

  const { error: upsertError } = await ctx.supabaseAdmin.from('users').upsert(
    {
      id: user.id,
      email,
      username: fallbackUsername(user.id),
      role: 'USER',
    },
    {
      onConflict: 'id',
      ignoreDuplicates: true,
    },
  );

  if (upsertError && (upsertError as DbErrorLike).code !== '23505') {
    handleDatabaseError(upsertError);
  }
}

export const reviewResolvers = {
  Query: {
    reviews: async (_parent: unknown, args: ReviewPaginationArgs, ctx: GraphQLContext) => {
      const limit = Math.min(
        Math.max(args.limit ?? DEFAULT_REVIEW_PAGE_SIZE, 1),
        MAX_REVIEW_PAGE_SIZE,
      );
      const offset = Math.max(args.offset ?? 0, 0);

      let query = ctx.supabase
        .from('reviews')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (args.productId) {
        query = query.eq('product_id', args.productId);
      } else {
        requireAdmin(ctx);
      }

      const { data, error } = await query;

      if (error) {
        handleDatabaseError(error);
      }

      return (data ?? []).map((row) => mapReview(row as ReviewRow));
    },
    reviewsCount: async (_parent: unknown, args: ReviewCountArgs, ctx: GraphQLContext) => {
      let query = ctx.supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true });

      if (args.productId) {
        query = query.eq('product_id', args.productId);
      } else {
        requireAdmin(ctx);
      }

      const { count, error } = await query;

      if (error) {
        handleDatabaseError(error);
      }

      return count ?? 0;
    },
  },
  Mutation: {
    createReview: async (
      _parent: unknown,
      args: { input: CreateReviewInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx);
      const sanitizedInput = sanitizeCreateReviewInput(args.input);
      validateCreateReviewInput(sanitizedInput);
      await ensureUserProfileForReview(ctx, user);
      await enforceReviewSubmissionRateLimit(ctx, user.id);

      const { data: createdData, error: createError } = await ctx.supabase
        .from('reviews')
        .insert(toDbReviewInput(sanitizedInput, user.id))
        .select('*')
        .single();

      if (createError) {
        const dbError = createError as DbErrorLike;
        if (dbError.code === '23505') {
          throw new ValidationError('You have already reviewed this product.', 'productId');
        }
        handleDatabaseError(createError);
      }

      const review = mapReview(createdData as ReviewRow);
      await pubsub.publish('REVIEW_ADDED', { reviewAdded: review });
      return review;
    },
    updateReview: async (
      _parent: unknown,
      args: { id: string; input: UpdateReviewInput },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);

      const { data: existingData, error: existingError } = await ctx.supabase
        .from('reviews')
        .select('*')
        .eq('id', args.id)
        .single();

      if (existingError) {
        handleDatabaseError(existingError);
      }

      const existingReview = mapReview(existingData as ReviewRow);
      requireOwnership(ctx, existingReview.userId);
      const sanitizedInput = sanitizeUpdateReviewInput(args.input);
      validateUpdateReviewInput(sanitizedInput);

      const { data, error } = await ctx.supabase
        .from('reviews')
        .update(toDbReviewInput(sanitizedInput))
        .eq('id', args.id)
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      return mapReview(data as ReviewRow);
    },
    deleteReview: async (_parent: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);

      const { data: existingData, error: existingError } = await ctx.supabase
        .from('reviews')
        .select('*')
        .eq('id', args.id)
        .single();

      if (existingError) {
        handleDatabaseError(existingError);
      }

      const existingReview = mapReview(existingData as ReviewRow);
      requireOwnership(ctx, existingReview.userId);

      const { error } = await ctx.supabase.from('reviews').delete().eq('id', args.id);
      if (error) {
        handleDatabaseError(error);
      }

      return true;
    },
  },
  Review: {
    product: (review: { productId: string }, _args: unknown, ctx: GraphQLContext) =>
      ctx.dataloaders.productLoader.load(review.productId),
    user: (review: { userId: string }, _args: unknown, ctx: GraphQLContext) =>
      ctx.dataloaders.userLoader.load(review.userId),
  },
};

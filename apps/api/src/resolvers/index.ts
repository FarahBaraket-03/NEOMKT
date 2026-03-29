import { GraphQLScalarType, Kind } from 'graphql';
import { brandResolvers } from './brand.js';
import { categoryResolvers } from './category.js';
import { productResolvers } from './product.js';
import { specResolvers } from './spec.js';
import { reviewResolvers } from './review.js';
import { subscriptionResolvers } from './subscriptions.js';
import { wishlistResolvers } from './wishlist.js';
import type { GraphQLContext } from '../types/context.js';

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 DateTime scalar',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    throw new TypeError('DateTime serialization expects Date or ISO string');
  },
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new TypeError('DateTime parseValue expects a string');
    }
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError('DateTime parseLiteral expects a string');
    }
    return new Date(ast.value);
  },
});

function getResolverFields(resolver: unknown): Record<string, unknown> {
  if (resolver && typeof resolver === 'object') {
    return resolver as Record<string, unknown>;
  }
  return {};
}

function canViewSensitiveUserFields(
  viewer: GraphQLContext['user'],
  targetUserId: string,
): boolean {
  if (!viewer) {
    return false;
  }

  return viewer.role === 'ADMIN' || viewer.id === targetUserId;
}

export const resolvers: Record<string, unknown> = {
  DateTime: DateTimeScalar,
  Query: {
    ...getResolverFields(brandResolvers.Query),
    ...getResolverFields(categoryResolvers.Query),
    ...getResolverFields(productResolvers.Query),
    ...getResolverFields(specResolvers.Query),
    ...getResolverFields(reviewResolvers.Query),
    ...getResolverFields(wishlistResolvers.Query),
  },
  Mutation: {
    ...getResolverFields(brandResolvers.Mutation),
    ...getResolverFields(categoryResolvers.Mutation),
    ...getResolverFields(productResolvers.Mutation),
    ...getResolverFields(specResolvers.Mutation),
    ...getResolverFields(reviewResolvers.Mutation),
    ...getResolverFields(wishlistResolvers.Mutation),
  },
  Brand: {
    ...getResolverFields(brandResolvers.Brand),
  },
  Category: {
    ...getResolverFields(categoryResolvers.Category),
  },
  Product: {
    ...getResolverFields(productResolvers.Product),
  },
  Review: {
    ...getResolverFields(reviewResolvers.Review),
  },
  User: {
    email: (
      user: { id: string; email: string },
      _args: unknown,
      ctx: GraphQLContext,
    ) => (canViewSensitiveUserFields(ctx.user, user.id) ? user.email : 'redacted@local.invalid'),
    role: (
      user: { id: string; role: 'PUBLIC' | 'USER' | 'ADMIN' },
      _args: unknown,
      ctx: GraphQLContext,
    ) => (canViewSensitiveUserFields(ctx.user, user.id) ? user.role : 'PUBLIC'),
  },
  WishlistItem: {
    ...getResolverFields(wishlistResolvers.WishlistItem),
  },
  Subscription: {
    ...getResolverFields(subscriptionResolvers.Subscription),
  },
};

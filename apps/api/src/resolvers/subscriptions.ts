import { withFilter } from 'graphql-subscriptions';
import { pubsub } from '../lib/pubsub.js';
import { requireAuth } from '../utils/authorization.js';
import type { GraphQLContext } from '../types/context.js';

interface ProductStockPayload {
  productStockChanged: { id: string };
}

interface PriceUpdatedPayload {
  priceUpdated: {
    oldPrice: number;
    newPrice: number;
    product: { id: string };
  };
}

interface ReviewAddedPayload {
  reviewAdded: { productId: string };
}

export const subscriptionResolvers = {
  Subscription: {
    productUpdated: {
      subscribe: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
        requireAuth(ctx);
        return pubsub.asyncIterator(['PRODUCT_UPDATED']);
      },
      resolve: (payload: unknown) => payload,
    },
    productStockChanged: {
      subscribe: withFilter(
        (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
          requireAuth(ctx);
          return pubsub.asyncIterator(['PRODUCT_STOCK_CHANGED']);
        },
        (payload: ProductStockPayload, variables: { productId?: string }) =>
          !variables.productId || payload.productStockChanged.id === variables.productId,
      ),
      resolve: (payload: ProductStockPayload) => payload.productStockChanged,
    },
    priceUpdated: {
      subscribe: withFilter(
        (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
          requireAuth(ctx);
          return pubsub.asyncIterator(['PRICE_UPDATED']);
        },
        (payload: PriceUpdatedPayload, variables: { productId?: string }) =>
          !variables.productId || payload.priceUpdated.product.id === variables.productId,
      ),
      resolve: (payload: PriceUpdatedPayload) => payload.priceUpdated,
    },
    reviewAdded: {
      subscribe: withFilter(
        (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
          requireAuth(ctx);
          return pubsub.asyncIterator(['REVIEW_ADDED']);
        },
        (payload: ReviewAddedPayload, variables: { productId: string }) =>
          payload.reviewAdded.productId === variables.productId,
      ),
      resolve: (payload: ReviewAddedPayload) => payload.reviewAdded,
    },
  },
};

import {
  useMutation,
  useQuery,
  useSubscription,
  type MutationHookOptions,
  type QueryHookOptions,
  type SubscriptionHookOptions,
} from '@apollo/client';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  GET_BRANDS,
  GET_CATEGORIES,
  GET_FEATURED_PRODUCTS,
  GET_HOME_STATS,
  GET_PRODUCTS,
  GET_REVIEWS,
  PRODUCT_STOCK_CHANGED_SUBSCRIPTION,
  PRODUCT_UPDATED_SUBSCRIPTION,
  REVIEW_ADDED_SUBSCRIPTION,
  UPDATE_REVIEW,
} from '../documents';

export function useProductsQuery(options?: QueryHookOptions) {
  return useQuery(GET_PRODUCTS, options);
}

export function useFeaturedProductsQuery(options?: QueryHookOptions) {
  return useQuery(GET_FEATURED_PRODUCTS, options);
}

export function useBrandsQuery(options?: QueryHookOptions) {
  return useQuery(GET_BRANDS, options);
}

export function useCategoriesQuery(options?: QueryHookOptions) {
  return useQuery(GET_CATEGORIES, options);
}

export function useHomeStatsQuery(options?: QueryHookOptions) {
  return useQuery(GET_HOME_STATS, options);
}

export function useReviewsQuery(options?: QueryHookOptions) {
  return useQuery(GET_REVIEWS, options);
}

export function useCreateReviewMutation(options?: MutationHookOptions) {
  return useMutation(CREATE_REVIEW, options);
}

export function useUpdateReviewMutation(options?: MutationHookOptions) {
  return useMutation(UPDATE_REVIEW, options);
}

export function useDeleteReviewMutation(options?: MutationHookOptions) {
  return useMutation(DELETE_REVIEW, options);
}

export function useProductUpdatedSubscription(options?: SubscriptionHookOptions) {
  return useSubscription(PRODUCT_UPDATED_SUBSCRIPTION, options);
}

export function useProductStockChangedSubscription(options?: SubscriptionHookOptions) {
  return useSubscription(PRODUCT_STOCK_CHANGED_SUBSCRIPTION, options);
}

export function useReviewAddedSubscription(options?: SubscriptionHookOptions) {
  return useSubscription(REVIEW_ADDED_SUBSCRIPTION, options);
}

import type { GraphQLContext } from '../types/context.js';
import type {
  ProductRow,
  ProductSpecRow,
  ProductStatus,
  ReviewRow,
} from '../lib/models.js';
import { mapProduct, mapProductSpec, mapReview } from '../lib/mappers.js';
import { adminMutation } from '../utils/adminMutation.js';
import { handleDatabaseError } from '../utils/errors.js';
import {
  validateCreateProductInput,
  validateUpdateProductInput,
} from '../validators/product.js';
import { pubsub } from '../lib/pubsub.js';

interface ProductFilterArgs {
  brandId?: string;
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

interface ProductInput {
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  status?: ProductStatus;
  brandId?: string;
  categoryId?: string;
  imageUrl?: string | null;
  images?: string[];
  releaseDate?: string | null;
}

const ALLOWED_SORT_COLUMNS = new Set([
  'name',
  'price',
  'created_at',
  'updated_at',
  'stock',
]);
const DEFAULT_PRODUCT_PAGE_SIZE = 20;
const MAX_PRODUCT_PAGE_SIZE = 100;
const DEFAULT_PRODUCT_RELATED_PAGE_SIZE = 20;
const MAX_PRODUCT_RELATED_PAGE_SIZE = 100;

interface ProductFieldPaginationArgs {
  limit?: number;
  offset?: number;
}

function resolvePagination(
  limit: number | undefined,
  offset: number | undefined,
  defaults: { limit: number; maxLimit: number },
): { limit: number; offset: number } {
  return {
    limit: Math.min(Math.max(limit ?? defaults.limit, 1), defaults.maxLimit),
    offset: Math.max(offset ?? 0, 0),
  };
}

function toDbProductInput(input: ProductInput): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.price !== undefined ? { price: input.price } : {}),
    ...(input.stock !== undefined ? { stock: input.stock } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.brandId !== undefined ? { brand_id: input.brandId } : {}),
    ...(input.categoryId !== undefined ? { category_id: input.categoryId } : {}),
    ...(input.imageUrl !== undefined ? { image_url: input.imageUrl } : {}),
    ...(input.images !== undefined ? { images: input.images } : {}),
    ...(input.releaseDate !== undefined ? { release_date: input.releaseDate } : {}),
  };
}

async function publishProductEvents(
  nextProduct: ReturnType<typeof mapProduct>,
  previousStock?: number,
  previousPrice?: number,
): Promise<void> {
  await pubsub.publish('PRODUCT_UPDATED', nextProduct);
  if (previousStock !== undefined && previousStock !== nextProduct.stock) {
    await pubsub.publish('PRODUCT_STOCK_CHANGED', { productStockChanged: nextProduct });
  }
  if (previousPrice !== undefined && previousPrice !== nextProduct.price) {
    await pubsub.publish('PRICE_UPDATED', {
      priceUpdated: {
        oldPrice: previousPrice,
        newPrice: nextProduct.price,
        product: nextProduct,
      },
    });
  }
}

interface ProductStatsRow {
  avg_rating: number | string | null;
  review_count: number | null;
}

async function loadProductStats(
  productId: string,
  ctx: GraphQLContext,
): Promise<{ avgRating: number; reviewCount: number }> {
  const { data, error } = await ctx.supabase
    .from('products_with_stats')
    .select('avg_rating, review_count')
    .eq('id', productId)
    .maybeSingle<ProductStatsRow>();

  if (error) {
    handleDatabaseError(error);
  }

  return {
    avgRating: data?.avg_rating !== null && data?.avg_rating !== undefined
      ? Number(data.avg_rating)
      : 0,
    reviewCount: data?.review_count ?? 0,
  };
}

export const productResolvers = {
  Query: {
    productsCount: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      const { count, error } = await ctx.supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      if (error) {
        handleDatabaseError(error);
      }

      return count ?? 0;
    },
    lowStockProductsCount: async (
      _parent: unknown,
      args: { threshold?: number },
      ctx: GraphQLContext,
    ) => {
      const threshold = Math.max(args.threshold ?? 10, 0);

      const { count, error } = await ctx.supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .lt('stock', threshold);

      if (error) {
        handleDatabaseError(error);
      }

      return count ?? 0;
    },
    products: async (_parent: unknown, args: ProductFilterArgs, ctx: GraphQLContext) => {
      let query = ctx.supabase.from('products').select('*');

      if (args.brandId) {
        query = query.eq('brand_id', args.brandId);
      }
      if (args.categoryId) {
        query = query.eq('category_id', args.categoryId);
      }
      if (args.status) {
        query = query.eq('status', args.status);
      }
      if (typeof args.minPrice === 'number') {
        query = query.gte('price', args.minPrice);
      }
      if (typeof args.maxPrice === 'number') {
        query = query.lte('price', args.maxPrice);
      }
      if (args.search && args.search.trim().length > 0) {
        query = query.textSearch('search_vector', args.search, { type: 'plain' });
      }

      const sortBy = ALLOWED_SORT_COLUMNS.has(args.sortBy ?? '')
        ? (args.sortBy as string)
        : 'created_at';
      const ascending = (args.sortOrder ?? 'DESC') === 'ASC';
      query = query.order(sortBy, { ascending });

      const pagination = resolvePagination(args.limit, args.offset, {
        limit: DEFAULT_PRODUCT_PAGE_SIZE,
        maxLimit: MAX_PRODUCT_PAGE_SIZE,
      });
      query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);

      const { data, error } = await query;
      if (error) {
        handleDatabaseError(error);
      }

      return (data ?? []).map((row) => mapProduct(row as ProductRow));
    },
    product: async (_parent: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const { data, error } = await ctx.supabase
        .from('products')
        .select('*')
        .eq('id', args.id)
        .maybeSingle();

      if (error) {
        handleDatabaseError(error);
      }

      return data ? mapProduct(data as ProductRow) : null;
    },
  },
  Mutation: {
    createProduct: adminMutation(async (
      _parent: unknown,
      args: { input: ProductInput },
      ctx: GraphQLContext,
    ) => {
      validateCreateProductInput(args.input);

      const { data, error } = await ctx.supabase
        .from('products')
        .insert(toDbProductInput(args.input))
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      const product = mapProduct(data as ProductRow);
      await publishProductEvents(product);
      return product;
    }),
    updateProduct: adminMutation(async (
      _parent: unknown,
      args: { id: string; input: ProductInput },
      ctx: GraphQLContext,
    ) => {
      validateUpdateProductInput(args.input);

      const { data: currentData, error: currentError } = await ctx.supabase
        .from('products')
        .select('*')
        .eq('id', args.id)
        .single();

      if (currentError) {
        handleDatabaseError(currentError);
      }

      const currentProduct = mapProduct(currentData as ProductRow);

      const { data, error } = await ctx.supabase
        .from('products')
        .update(toDbProductInput(args.input))
        .eq('id', args.id)
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      const nextProduct = mapProduct(data as ProductRow);
      await publishProductEvents(nextProduct, currentProduct.stock, currentProduct.price);
      return nextProduct;
    }),
    deleteProduct: adminMutation(async (
      _parent: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      const { error } = await ctx.supabase.from('products').delete().eq('id', args.id);
      if (error) {
        handleDatabaseError(error);
      }
      return true;
    }),
  },
  Product: {
    brand: (product: { brandId: string }, _args: unknown, ctx: GraphQLContext) =>
      ctx.dataloaders.brandLoader.load(product.brandId),
    category: (product: { categoryId: string }, _args: unknown, ctx: GraphQLContext) =>
      ctx.dataloaders.categoryLoader.load(product.categoryId),
    specs: async (
      product: { id: string },
      args: ProductFieldPaginationArgs,
      ctx: GraphQLContext,
    ) => {
      const pagination = resolvePagination(args.limit, args.offset, {
        limit: DEFAULT_PRODUCT_RELATED_PAGE_SIZE,
        maxLimit: MAX_PRODUCT_RELATED_PAGE_SIZE,
      });

      const { data, error } = await ctx.supabase
        .from('specs')
        .select('*')
        .eq('product_id', product.id)
        .range(pagination.offset, pagination.offset + pagination.limit - 1)
        .order('display_order', { ascending: true });

      if (error) {
        handleDatabaseError(error);
      }

      return (data ?? []).map((row) => mapProductSpec(row as ProductSpecRow));
    },
    reviews: async (
      product: { id: string },
      args: ProductFieldPaginationArgs,
      ctx: GraphQLContext,
    ) => {
      const pagination = resolvePagination(args.limit, args.offset, {
        limit: DEFAULT_PRODUCT_RELATED_PAGE_SIZE,
        maxLimit: MAX_PRODUCT_RELATED_PAGE_SIZE,
      });

      const { data, error } = await ctx.supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .range(pagination.offset, pagination.offset + pagination.limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        handleDatabaseError(error);
      }

      return (data ?? []).map((row) => mapReview(row as ReviewRow));
    },
    avgRating: async (product: { id: string }, _args: unknown, ctx: GraphQLContext) => {
      const stats = await loadProductStats(product.id, ctx);
      return stats.avgRating;
    },
    reviewCount: async (product: { id: string }, _args: unknown, ctx: GraphQLContext) => {
      const stats = await loadProductStats(product.id, ctx);
      return stats.reviewCount;
    },
  },
};

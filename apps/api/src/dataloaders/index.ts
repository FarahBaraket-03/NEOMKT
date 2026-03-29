import DataLoader from 'dataloader';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Brand,
  BrandRow,
  Category,
  CategoryRow,
  Product,
  ProductRow,
  ProductSpec,
  ProductSpecRow,
  Review,
  ReviewRow,
  User,
  UserRow,
} from '../lib/models.js';
import {
  mapBrand,
  mapCategory,
  mapProduct,
  mapProductSpec,
  mapReview,
  mapUser,
} from '../lib/mappers.js';
import { DatabaseError } from '../utils/errors.js';

const MAX_DATALOADER_BATCH_KEYS = 200;
const MAX_RELATED_ITEMS_PER_ENTITY = 100;

function fallbackUsername(userId: string): string {
  return `user_${userId.replace(/-/g, '')}`;
}

function fallbackUser(userId: string): User {
  const now = new Date().toISOString();
  return {
    id: userId,
    email: 'redacted@local.invalid',
    username: fallbackUsername(userId),
    role: 'PUBLIC',
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
  };
}

function enforceBatchSize(loaderName: string, keys: readonly string[]): void {
  if (keys.length > MAX_DATALOADER_BATCH_KEYS) {
    throw new DatabaseError(
      `${loaderName} received ${keys.length} keys, which exceeds the maximum batch size of ${MAX_DATALOADER_BATCH_KEYS}`,
    );
  }
}

function keyById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function groupByField<T>(
  items: T[],
  field: (item: T) => string,
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = field(item);
    const current = map.get(key) ?? [];
    current.push(item);
    map.set(key, current);
  }
  return map;
}

export interface DataLoaders {
  brandLoader: DataLoader<string, Brand>;
  categoryLoader: DataLoader<string, Category>;
  productLoader: DataLoader<string, Product>;
  userLoader: DataLoader<string, User>;
  productsByBrandLoader: DataLoader<string, Product[]>;
  productsByCategoryLoader: DataLoader<string, Product[]>;
  specsByProductLoader: DataLoader<string, ProductSpec[]>;
  reviewsByProductLoader: DataLoader<string, Review[]>;
}

export function createDataLoaders(supabase: SupabaseClient): DataLoaders {
  const brandLoader = new DataLoader<string, Brand>(async (ids) => {
    enforceBatchSize('brandLoader', ids);

    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .in('id', [...ids]);

    if (error) {
      throw new DatabaseError(error.message);
    }

    const brands = (data ?? []).map((row) => mapBrand(row as BrandRow));
    const indexed = keyById(brands);
    return ids.map((id) => {
      const brand = indexed.get(id);
      if (!brand) {
        throw new DatabaseError(`Brand not found for id ${id}`);
      }
      return brand;
    });
  });

  const categoryLoader = new DataLoader<string, Category>(async (ids) => {
    enforceBatchSize('categoryLoader', ids);

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .in('id', [...ids]);

    if (error) {
      throw new DatabaseError(error.message);
    }

    const categories = (data ?? []).map((row) => mapCategory(row as CategoryRow));
    const indexed = keyById(categories);

    return ids.map((id) => {
      const category = indexed.get(id);
      if (!category) {
        throw new DatabaseError(`Category not found for id ${id}`);
      }
      return category;
    });
  });

  const productLoader = new DataLoader<string, Product>(async (ids) => {
    enforceBatchSize('productLoader', ids);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', [...ids]);

    if (error) {
      throw new DatabaseError(error.message);
    }

    const products = (data ?? []).map((row) => mapProduct(row as ProductRow));
    const indexed = keyById(products);

    return ids.map((id) => {
      const product = indexed.get(id);
      if (!product) {
        throw new DatabaseError(`Product not found for id ${id}`);
      }
      return product;
    });
  });

  const userLoader = new DataLoader<string, User>(async (ids) => {
    enforceBatchSize('userLoader', ids);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('id', [...ids]);

    if (error) {
      throw new DatabaseError(error.message);
    }

    const users = (data ?? []).map((row) => mapUser(row as UserRow));
    const indexed = keyById(users);

    return ids.map((id) => {
      const user = indexed.get(id);
      if (!user) {
        return fallbackUser(id);
      }
      return user;
    });
  });

  const productsByBrandLoader = new DataLoader<string, Product[]>(async (brandIds) => {
    enforceBatchSize('productsByBrandLoader', brandIds);

    const maximumRows = MAX_DATALOADER_BATCH_KEYS * MAX_RELATED_ITEMS_PER_ENTITY;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('brand_id', [...brandIds])
      .limit(maximumRows)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    const products = (data ?? []).map((row) => mapProduct(row as ProductRow));
    const grouped = groupByField(products, (product) => product.brandId);

    return brandIds.map(
      (brandId) => (grouped.get(brandId) ?? []).slice(0, MAX_RELATED_ITEMS_PER_ENTITY),
    );
  });

  const productsByCategoryLoader = new DataLoader<string, Product[]>(async (categoryIds) => {
    enforceBatchSize('productsByCategoryLoader', categoryIds);

    const maximumRows = MAX_DATALOADER_BATCH_KEYS * MAX_RELATED_ITEMS_PER_ENTITY;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('category_id', [...categoryIds])
      .limit(maximumRows)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    const products = (data ?? []).map((row) => mapProduct(row as ProductRow));
    const grouped = groupByField(products, (product) => product.categoryId);

    return categoryIds.map(
      (categoryId) => (grouped.get(categoryId) ?? []).slice(0, MAX_RELATED_ITEMS_PER_ENTITY),
    );
  });

  const specsByProductLoader = new DataLoader<string, ProductSpec[]>(async (productIds) => {
    enforceBatchSize('specsByProductLoader', productIds);

    const maximumRows = MAX_DATALOADER_BATCH_KEYS * MAX_RELATED_ITEMS_PER_ENTITY;
    const { data, error } = await supabase
      .from('specs')
      .select('*')
      .in('product_id', [...productIds])
      .limit(maximumRows)
      .order('display_order', { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    const specs = (data ?? []).map((row) => mapProductSpec(row as ProductSpecRow));
    const grouped = groupByField(specs, (spec) => spec.productId);

    return productIds.map(
      (productId) => (grouped.get(productId) ?? []).slice(0, MAX_RELATED_ITEMS_PER_ENTITY),
    );
  });

  const reviewsByProductLoader = new DataLoader<string, Review[]>(async (productIds) => {
    enforceBatchSize('reviewsByProductLoader', productIds);

    const maximumRows = MAX_DATALOADER_BATCH_KEYS * MAX_RELATED_ITEMS_PER_ENTITY;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .in('product_id', [...productIds])
      .limit(maximumRows)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    const reviews = (data ?? []).map((row) => mapReview(row as ReviewRow));
    const grouped = groupByField(reviews, (review) => review.productId);

    return productIds.map(
      (productId) => (grouped.get(productId) ?? []).slice(0, MAX_RELATED_ITEMS_PER_ENTITY),
    );
  });

  return {
    brandLoader,
    categoryLoader,
    productLoader,
    userLoader,
    productsByBrandLoader,
    productsByCategoryLoader,
    specsByProductLoader,
    reviewsByProductLoader,
  };
}

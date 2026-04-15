import type { GraphQLContext } from '../types/context.js';
import type { CategoryRow } from '../lib/models.js';
import { mapCategory } from '../lib/mappers.js';
import { adminMutation } from '../utils/adminMutation.js';
import { handleDatabaseError } from '../utils/errors.js';
import {
  validateCreateCategoryInput,
  validateUpdateCategoryInput,
} from '../validators/category.js';
import { sanitizeText, sanitizeOptionalText } from '../utils/sanitization.js';

interface CategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  icon?: string | null;
}

interface CategoryChildrenArgs {
  limit?: number;
  offset?: number;
}

const DEFAULT_CATEGORY_CHILDREN_LIMIT = 50;
const MAX_CATEGORY_CHILDREN_LIMIT = 100;

function toDbCategoryInput(input: CategoryInput): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.parentId !== undefined ? { parent_id: input.parentId } : {}),
    ...(input.icon !== undefined ? { icon: input.icon } : {}),
  };
}

function sanitizeCategoryInput(input: CategoryInput): CategoryInput {
  return {
    ...input,
    ...(input.name !== undefined ? { name: sanitizeText(input.name) } : {}),
    ...(input.description !== undefined
      ? { description: sanitizeOptionalText(input.description) }
      : {}),
  };
}

export const categoryResolvers = {
  Query: {
    categories: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      const { data, error } = await ctx.supabase.from('categories').select('*').order('name');
      if (error) {
        handleDatabaseError(error);
      }
      return (data ?? []).map((row) => mapCategory(row as CategoryRow));
    },
    category: async (_parent: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const { data, error } = await ctx.supabase
        .from('categories')
        .select('*')
        .eq('id', args.id)
        .maybeSingle();

      if (error) {
        handleDatabaseError(error);
      }
      return data ? mapCategory(data as CategoryRow) : null;
    },
  },
  Mutation: {
    createCategory: adminMutation(async (
      _parent: unknown,
      args: { input: CategoryInput },
      ctx: GraphQLContext,
    ) => {
      const sanitizedInput = sanitizeCategoryInput(args.input);
      validateCreateCategoryInput(sanitizedInput);

      const { data, error } = await ctx.supabase
        .from('categories')
        .insert(toDbCategoryInput(sanitizedInput))
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      return mapCategory(data as CategoryRow);
    }),
    updateCategory: adminMutation(async (
      _parent: unknown,
      args: { id: string; input: CategoryInput },
      ctx: GraphQLContext,
    ) => {
      const sanitizedInput = sanitizeCategoryInput(args.input);
      validateUpdateCategoryInput(sanitizedInput);

      const { data, error } = await ctx.supabase
        .from('categories')
        .update(toDbCategoryInput(sanitizedInput))
        .eq('id', args.id)
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      return mapCategory(data as CategoryRow);
    }),
    deleteCategory: adminMutation(async (
      _parent: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      const { error } = await ctx.supabase.from('categories').delete().eq('id', args.id);
      if (error) {
        handleDatabaseError(error);
      }
      return true;
    }),
  },
  Category: {
    parent: async (category: { parentId: string | null }, _args: unknown, ctx: GraphQLContext) => {
      if (!category.parentId) {
        return null;
      }
      return ctx.dataloaders.categoryLoader.load(category.parentId);
    },
    children: async (
      category: { id: string },
      args: CategoryChildrenArgs,
      ctx: GraphQLContext,
    ) => {
      const limit = Math.min(
        Math.max(args.limit ?? DEFAULT_CATEGORY_CHILDREN_LIMIT, 1),
        MAX_CATEGORY_CHILDREN_LIMIT,
      );
      const offset = Math.max(args.offset ?? 0, 0);

      const { data, error } = await ctx.supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id)
        .range(offset, offset + limit - 1)
        .order('name');

      if (error) {
        handleDatabaseError(error);
      }

      return (data ?? []).map((row) => mapCategory(row as CategoryRow));
    },
    products: (category: { id: string }, _args: unknown, ctx: GraphQLContext) =>
      ctx.dataloaders.productsByCategoryLoader.load(category.id),
  },
};

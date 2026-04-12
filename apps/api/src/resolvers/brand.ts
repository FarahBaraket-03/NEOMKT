import type { GraphQLContext } from '../types/context.js';
import type { BrandRow } from '../lib/models.js';
import { mapBrand } from '../lib/mappers.js';
import { adminMutation } from '../utils/adminMutation.js';
import { handleDatabaseError } from '../utils/errors.js';
import {
  validateCreateBrandInput,
  validateUpdateBrandInput,
} from '../validators/brand.js';
import { sanitizeText, sanitizeOptionalText } from '../utils/sanitization.js';

interface CreateBrandInput {
  name: string;
  slug: string;
  country?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  foundedYear?: number | null;
  description?: string | null;
}

interface UpdateBrandInput {
  name?: string;
  slug?: string;
  country?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  foundedYear?: number | null;
  description?: string | null;
}

function sanitizeBrandInput<T extends CreateBrandInput | UpdateBrandInput>(input: T): T {
  return {
    ...input,
    ...(input.name !== undefined ? { name: sanitizeText(input.name) } : {}),
    ...(input.slug !== undefined ? { slug: sanitizeText(input.slug) } : {}),
    ...(input.country !== undefined ? { country: sanitizeOptionalText(input.country) } : {}),
    ...(input.description !== undefined ? { description: sanitizeOptionalText(input.description) } : {}),
  };
}

function toDbBrandInput(input: CreateBrandInput | UpdateBrandInput): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.country !== undefined ? { country: input.country } : {}),
    ...(input.logoUrl !== undefined ? { logo_url: input.logoUrl } : {}),
    ...(input.websiteUrl !== undefined ? { website_url: input.websiteUrl } : {}),
    ...(input.foundedYear !== undefined ? { founded_year: input.foundedYear } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
  };
}

export const brandResolvers = {
  Query: {
    brands: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      const { data, error } = await ctx.supabase.from('brands').select('*').order('name');
      if (error) {
        handleDatabaseError(error);
      }
      return (data ?? []).map((row) => mapBrand(row as BrandRow));
    },
    brand: async (_parent: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const { data, error } = await ctx.supabase
        .from('brands')
        .select('*')
        .eq('id', args.id)
        .maybeSingle();

      if (error) {
        handleDatabaseError(error);
      }
      return data ? mapBrand(data as BrandRow) : null;
    },
  },
  Mutation: {
    createBrand: adminMutation(async (
      _parent: unknown,
      args: { input: CreateBrandInput },
      ctx: GraphQLContext,
    ) => {
      const sanitizedInput = sanitizeBrandInput(args.input);
      validateCreateBrandInput(sanitizedInput);

      const { data, error } = await ctx.supabase
        .from('brands')
        .insert(toDbBrandInput(sanitizedInput))
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }
      return mapBrand(data as BrandRow);
    }),
    updateBrand: adminMutation(async (
      _parent: unknown,
      args: { id: string; input: UpdateBrandInput },
      ctx: GraphQLContext,
    ) => {
      const sanitizedInput = sanitizeBrandInput(args.input);
      validateUpdateBrandInput(sanitizedInput);

      const { data, error } = await ctx.supabase
        .from('brands')
        .update(toDbBrandInput(sanitizedInput))
        .eq('id', args.id)
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      return mapBrand(data as BrandRow);
    }),
    deleteBrand: adminMutation(async (
      _parent: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      const { error } = await ctx.supabase.from('brands').delete().eq('id', args.id);
      if (error) {
        handleDatabaseError(error);
      }
      return true;
    }),
  },
  Brand: {
    products: (brand: { id: string }, _args: unknown, ctx: GraphQLContext) =>
      ctx.dataloaders.productsByBrandLoader.load(brand.id),
  },
};

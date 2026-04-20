import type { GraphQLContext } from '../types/context.js';
import type { ProductSpecRow } from '../lib/models.js';
import { mapProductSpec } from '../lib/mappers.js';
import { adminMutation } from '../utils/adminMutation.js';
import { handleDatabaseError } from '../utils/errors.js';
import { sanitizeText, sanitizeOptionalText } from '../utils/sanitization.js';
import {
  validateCreateProductSpecInput,
  validateUpdateProductSpecInput,
} from '../validators/spec.js';

interface ProductSpecInput {
  productId?: string;
  key?: string;
  value?: string;
  unit?: string | null;
  displayOrder?: number;
}

function toDbSpecInput(input: ProductSpecInput): Record<string, unknown> {
  return {
    ...(input.productId !== undefined ? { product_id: input.productId } : {}),
    ...(input.key !== undefined ? { key: input.key } : {}),
    ...(input.value !== undefined ? { value: input.value } : {}),
    ...(input.unit !== undefined ? { unit: input.unit } : {}),
    ...(input.displayOrder !== undefined ? { display_order: input.displayOrder } : {}),
  };
}

function sanitizeSpecInput(input: ProductSpecInput): ProductSpecInput {
  return {
    ...input,
    ...(input.key !== undefined ? { key: sanitizeText(input.key) } : {}),
    ...(input.value !== undefined ? { value: sanitizeText(input.value) } : {}),
    ...(input.unit !== undefined ? { unit: sanitizeOptionalText(input.unit) } : {}),
  };
}

export const specResolvers = {
  Query: {
    productSpecs: async (_parent: unknown, args: { productId: string }, ctx: GraphQLContext) => {
      const { data, error } = await ctx.supabase
        .from('specs')
        .select('*')
        .eq('product_id', args.productId)
        .order('display_order', { ascending: true });

      if (error) {
        handleDatabaseError(error);
      }

      return (data ?? []).map((row) => mapProductSpec(row as ProductSpecRow));
    },
  },
  Mutation: {
    createProductSpec: adminMutation(async (
      _parent: unknown,
      args: { input: ProductSpecInput },
      ctx: GraphQLContext,
    ) => {
      const sanitizedInput = sanitizeSpecInput(args.input);
      validateCreateProductSpecInput(sanitizedInput);

      const { data, error } = await ctx.supabase
        .from('specs')
        .insert(toDbSpecInput(sanitizedInput))
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      return mapProductSpec(data as ProductSpecRow);
    }),
    updateProductSpec: adminMutation(async (
      _parent: unknown,
      args: { id: string; input: ProductSpecInput },
      ctx: GraphQLContext,
    ) => {
      const sanitizedInput = sanitizeSpecInput(args.input);
      validateUpdateProductSpecInput(sanitizedInput);

      const { data, error } = await ctx.supabase
        .from('specs')
        .update(toDbSpecInput(sanitizedInput))
        .eq('id', args.id)
        .select('*')
        .single();

      if (error) {
        handleDatabaseError(error);
      }

      return mapProductSpec(data as ProductSpecRow);
    }),
    deleteProductSpec: adminMutation(async (
      _parent: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      const { error } = await ctx.supabase.from('specs').delete().eq('id', args.id);
      if (error) {
        handleDatabaseError(error);
      }
      return true;
    }),
  },
};

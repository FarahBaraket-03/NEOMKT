import type { GraphQLContext } from '../types/context.js';
import { requireAdmin } from './authorization.js';

type AdminMutationResolver<Parent, Args, Result> = (
  parent: Parent,
  args: Args,
  ctx: GraphQLContext,
  info: unknown,
) => Promise<Result> | Result;

export function adminMutation<Parent, Args, Result>(
  resolver: AdminMutationResolver<Parent, Args, Result>,
): AdminMutationResolver<Parent, Args, Result> {
  return (parent, args, ctx, info) => {
    requireAdmin(ctx);

    const privilegedContext: GraphQLContext = {
      ...ctx,
      supabase: ctx.supabaseAdmin,
    };

    return resolver(parent, args, privilegedContext, info);
  };
}
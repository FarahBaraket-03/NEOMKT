import type { AuthenticatedUser, GraphQLContext } from '../types/context.js';
import { AuthenticationError, AuthorizationError } from './errors.js';

export function requireAuth(ctx: GraphQLContext): AuthenticatedUser {
  if (!ctx.user) {
    throw new AuthenticationError();
  }
  return ctx.user;
}

export function requireAdmin(ctx: GraphQLContext): AuthenticatedUser {
  const user = requireAuth(ctx);
  if (user.role !== 'ADMIN') {
    throw new AuthorizationError('Admin role required');
  }
  return user;
}

export function requireOwnership(
  ctx: GraphQLContext,
  resourceUserId: string,
): AuthenticatedUser {
  const user = requireAuth(ctx);
  if (user.role === 'ADMIN') {
    return user;
  }
  if (user.id !== resourceUserId) {
    throw new AuthorizationError('You do not own this resource');
  }
  return user;
}

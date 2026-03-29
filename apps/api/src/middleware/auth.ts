import type { SupabaseClient } from '@supabase/supabase-js';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/context.js';
import { createUserClient } from '../lib/supabase.js';

interface UserRoleRow {
  role: AuthenticatedUser['role'];
}

export function extractBearerTokenFromAuthorization(
  authorizationHeader: string | null | undefined,
): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const token = match[1]?.trim();
  if (!token) {
    return null;
  }

  return token;
}

export function extractBearerToken(req: Request): string | null {
  return extractBearerTokenFromAuthorization(req.headers.authorization);
}

async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AuthenticatedUser['role'] | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle<UserRoleRow>();

  if (error) {
    return null;
  }

  return data?.role ?? null;
}

export async function authenticateUser(
  req: Request,
  supabase: SupabaseClient,
): Promise<AuthenticatedUser | null> {
  const token = extractBearerToken(req);
  if (!token) {
    return null;
  }

  return authenticateToken(token, supabase);
}

export async function authenticateToken(
  token: string,
  supabase: SupabaseClient,
): Promise<AuthenticatedUser | null> {
  try {
    const { data, error: authError } = await supabase.auth.getUser(token);
    if (authError || !data.user) {
      return null;
    }

    let role = await getUserRole(supabase, data.user.id);

    if (!role) {
      const fallbackClient = createUserClient(token);
      role = await getUserRole(fallbackClient, data.user.id);
    }

    return {
      id: data.user.id,
      email: data.user.email ?? '',
      role: role ?? 'USER',
    };
  } catch {
    return null;
  }
}

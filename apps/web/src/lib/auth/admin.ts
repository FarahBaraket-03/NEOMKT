import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerComponentClient } from './server';

interface UserRoleRow {
  role: 'PUBLIC' | 'USER' | 'ADMIN';
}

interface EnsureAdminAccessResult {
  supabase: SupabaseClient;
  userId: string;
  accessToken: string;
}

interface GraphQLErrorLike {
  message?: string;
  extensions?: {
    code?: string;
  };
}

interface ApolloErrorLike extends Error {
  graphQLErrors?: GraphQLErrorLike[];
}

export function redirectOnAdminGraphQLError(error: unknown): never {
  const apolloError = error as ApolloErrorLike;
  const graphQLErrors = Array.isArray(apolloError?.graphQLErrors)
    ? apolloError.graphQLErrors
    : [];

  const isForbidden = graphQLErrors.some(
    (graphQLError) =>
      graphQLError.extensions?.code === 'FORBIDDEN'
      || graphQLError.message === 'Admin role required',
  );

  const hasAdminRoleMessage =
    typeof apolloError?.message === 'string'
    && apolloError.message.includes('Admin role required');

  if (isForbidden || hasAdminRoleMessage) {
    redirect('/auth/login?redirectedFrom=/admin');
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Unknown admin GraphQL error');
}

export async function ensureAdminAccess(): Promise<EnsureAdminAccessResult> {
  const supabase = await createServerComponentClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;

  if (sessionError || !accessToken) {
    redirect('/auth/login');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    redirect('/auth/login');
  }

  const { data: roleRow, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<UserRoleRow>();

  if (error || roleRow?.role !== 'ADMIN') {
    redirect('/');
  }

  return {
    supabase,
    userId: user.id,
    accessToken,
  };
}
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function createUserClient(token?: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    ...(token
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      : {}),
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function checkDatabaseHealth(): Promise<boolean> {
  const { error } = await supabaseAdmin.from('brands').select('id').limit(1);
  return !error;
}

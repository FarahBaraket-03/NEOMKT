import type { SupabaseClient } from '@supabase/supabase-js';
import type { IncomingMessage } from 'node:http';
import type { DataLoaders } from '../dataloaders/index.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'PUBLIC' | 'USER' | 'ADMIN';
}

export interface GraphQLContext {
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  dataloaders: DataLoaders;
  user: AuthenticatedUser | null;
  req: IncomingMessage;
}

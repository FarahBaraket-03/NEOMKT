import type { IncomingMessage } from 'node:http';
import type { Request } from 'express';
import { createUserClient, supabaseAdmin } from './supabase.js';
import {
  authenticateToken,
  extractBearerToken,
  extractBearerTokenFromAuthorization,
} from '../middleware/auth.js';
import { createDataLoaders } from '../dataloaders/index.js';
import type { GraphQLContext } from '../types/context.js';

interface WsRequestLike {
  headers?: Record<string, string | string[] | undefined>;
}

function readHeaderAuthorization(
  headers: Record<string, unknown> | undefined,
): string | null {
  if (!headers) {
    return null;
  }

  const value = headers.authorization ?? headers.Authorization;
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return null;
}

function extractWsBearerToken(connectionParams: unknown): string | null {
  if (!connectionParams || typeof connectionParams !== 'object') {
    return null;
  }

  const asRecord = connectionParams as Record<string, unknown>;

  const directAuthorization = asRecord.authorization;
  if (typeof directAuthorization === 'string') {
    return extractBearerTokenFromAuthorization(directAuthorization);
  }

  const headers = asRecord.headers;
  if (!headers || typeof headers !== 'object') {
    return null;
  }

  const headerAuthorization = readHeaderAuthorization(headers as Record<string, unknown>);
  return extractBearerTokenFromAuthorization(headerAuthorization);
}

async function buildContextFromToken(
  token: string | null,
  req: IncomingMessage,
): Promise<GraphQLContext> {
  const user = token ? await authenticateToken(token, supabaseAdmin) : null;
  const supabase = createUserClient(token ?? undefined);
  const dataloaders = createDataLoaders(supabase);

  return {
    supabase,
    supabaseAdmin,
    dataloaders,
    user,
    req,
  };
}

export async function createContext({ req }: { req: Request }): Promise<GraphQLContext> {
  const token = extractBearerToken(req);
  return buildContextFromToken(token, req);
}

export async function createWsContext(input: {
  connectionParams?: unknown;
  request?: WsRequestLike;
}): Promise<GraphQLContext> {
  const token = extractWsBearerToken(input.connectionParams);
  const request =
    (input.request as IncomingMessage | undefined) ?? ({ headers: {} } as IncomingMessage);

  return buildContextFromToken(token, request);
}

export async function assertWsConnectionAuthorized(connectionParams?: unknown): Promise<void> {
  const token = extractWsBearerToken(connectionParams);
  if (!token) {
    throw new Error('Unauthorized');
  }

  const user = await authenticateToken(token, supabaseAdmin);
  if (!user) {
    throw new Error('Unauthorized');
  }
}

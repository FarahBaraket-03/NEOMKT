import { NextResponse, type NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_DURATION_MS = 15 * 60 * 1000;

interface LoginAttemptState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

interface LoginRequestBody {
  email?: string;
  password?: string;
}

interface LoginResponseBody {
  accessToken: string;
  refreshToken: string;
}

const loginAttempts = new Map<string, LoginAttemptState>();

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

function getAttemptKey(email: string, req: NextRequest): string {
  return `${getClientIp(req)}:${email.toLowerCase()}`;
}

function getOrCreateAttemptState(key: string): LoginAttemptState {
  const current = loginAttempts.get(key);
  if (current) {
    return current;
  }

  const initialState: LoginAttemptState = {
    failedAttempts: 0,
    lockoutUntil: null,
  };

  loginAttempts.set(key, initialState);
  return initialState;
}

function clearLoginAttemptState(key: string): void {
  loginAttempts.delete(key);
}

function markFailedAttempt(key: string, now: number): LoginAttemptState {
  const state = getOrCreateAttemptState(key);

  if (state.lockoutUntil !== null && state.lockoutUntil <= now) {
    state.failedAttempts = 0;
    state.lockoutUntil = null;
  }

  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    state.lockoutUntil = now + LOGIN_LOCKOUT_DURATION_MS;
    state.failedAttempts = 0;
  }

  loginAttempts.set(key, state);
  return state;
}

function isLocked(state: LoginAttemptState, now: number): boolean {
  return state.lockoutUntil !== null && state.lockoutUntil > now;
}

function parseLoginRequestBody(body: unknown): LoginRequestBody {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const parsed = body as Record<string, unknown>;

  return {
    email: typeof parsed.email === 'string' ? parsed.email.trim() : undefined,
    password: typeof parsed.password === 'string' ? parsed.password : undefined,
  };
}

function unauthorized(lockoutUntil?: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Authentication failed.',
      ...(typeof lockoutUntil === 'number' ? { lockoutUntil } : {}),
    },
    { status: 401 },
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const now = Date.now();

  let requestJson: unknown;
  try {
    requestJson = await req.json();
  } catch {
    return unauthorized();
  }

  const { email, password } = parseLoginRequestBody(requestJson);
  if (!email || !password) {
    return unauthorized();
  }

  const attemptKey = getAttemptKey(email, req);
  const attemptState = getOrCreateAttemptState(attemptKey);

  if (isLocked(attemptState, now)) {
    return unauthorized(attemptState.lockoutUntil ?? undefined);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    const updatedAttemptState = markFailedAttempt(attemptKey, now);
    const lockoutUntil =
      updatedAttemptState.lockoutUntil !== null && updatedAttemptState.lockoutUntil > now
        ? updatedAttemptState.lockoutUntil
        : undefined;
    return unauthorized(lockoutUntil);
  }

  clearLoginAttemptState(attemptKey);

  const payload: LoginResponseBody = {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

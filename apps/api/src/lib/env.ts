import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  PORT: number;
  NODE_ENV: 'development' | 'test' | 'production';
  GRAPHQL_INTROSPECTION: boolean;
  CORS_ORIGINS: string | string[];
}

function getEnvVar(name: keyof Omit<EnvConfig, 'PORT' | 'NODE_ENV'>): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getNodeEnv(): EnvConfig['NODE_ENV'] {
  const raw = process.env.NODE_ENV ?? 'development';
  if (raw !== 'development' && raw !== 'test' && raw !== 'production') {
    throw new Error(
      'Invalid NODE_ENV. Expected one of: development, test, production',
    );
  }
  return raw;
}

function getPort(): number {
  const raw = process.env.PORT ?? '4000';
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid PORT. Expected a positive integer.');
  }
  return parsed;
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim().length === 0) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') {
    return true;
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') {
    return false;
  }

  throw new Error('Invalid GRAPHQL_INTROSPECTION. Expected a boolean-like value.');
}

function parseCorsOrigins(value: string | undefined): string | string[] {
  if (!value || value.trim().length === 0) {
    return '*';
  }

  if (value.includes(',')) {
    return value.split(',').map((origin) => origin.trim()).filter((origin) => origin.length > 0);
  }

  return value.trim();
}

export function validateEnv(): EnvConfig {
  const nodeEnv = getNodeEnv();

  const config: EnvConfig = {
    SUPABASE_URL: getEnvVar('SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    PORT: getPort(),
    NODE_ENV: nodeEnv,
    GRAPHQL_INTROSPECTION: parseBooleanEnv(
      process.env.GRAPHQL_INTROSPECTION,
      true,
    ),
    CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGINS),
  };

  if (
    config.NODE_ENV !== 'test'
    && config.SUPABASE_ANON_KEY === config.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn(
      '[Env] SUPABASE_SERVICE_ROLE_KEY matches SUPABASE_ANON_KEY. '
      + 'Admin role resolution and privileged operations may fail. '
      + 'Use the real service role key from Supabase project settings.',
    );
  }

  return config;
}

export const env = validateEnv();

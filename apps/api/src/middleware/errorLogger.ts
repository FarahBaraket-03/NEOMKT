interface LoggableGraphQLError {
  message: string;
  path?: readonly (string | number)[];
  extensions?: Record<string, unknown>;
  stack?: string;
  originalError?: {
    stack?: string;
  };
}

interface LogErrorInput {
  error: LoggableGraphQLError;
  operationName?: string;
  userId?: string | null;
}

export function logError({ error, operationName, userId }: LogErrorInput): void {
  const payload = {
    timestamp: new Date().toISOString(),
    userId: userId ?? null,
    operationName: operationName ?? 'unknown',
    message: error.message,
    path: error.path,
    code: error.extensions?.code,
    stack:
      process.env.NODE_ENV === 'development' ? (error.originalError?.stack ?? error.stack) : undefined,
  };

  console.error('[GraphQLError]', JSON.stringify(payload));
}

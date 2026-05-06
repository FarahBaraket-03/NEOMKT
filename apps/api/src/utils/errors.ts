import { GraphQLError } from 'graphql';

export class AuthenticationError extends GraphQLError {
  constructor(message = 'Authentication is required') {
    super(message, {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

export class AuthorizationError extends GraphQLError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string, field?: string) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        field,
      },
    });
  }
}

export class DatabaseError extends GraphQLError {
  constructor(
    message = 'An internal database error occurred',
    originalError?: any,
  ) {
    super(message, {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

interface DbErrorShape {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export function handleDatabaseError(error: unknown): never {
  const dbError = (error ?? {}) as DbErrorShape;

  if (dbError.code === '23505') {
    const fieldMatch = dbError.details?.match(/\(([^)]+)\)=/);
    const field = fieldMatch?.[1] ?? 'field';
    throw new ValidationError(`A record with this ${field} already exists`, field);
  }

  if (dbError.code === '23503') {
    throw new ValidationError('Referenced entity does not exist');
  }

  if (dbError.code === '23514') {
    throw new ValidationError('Value does not meet validation requirements');
  }

  throw new DatabaseError('An internal database error occurred', error);
}

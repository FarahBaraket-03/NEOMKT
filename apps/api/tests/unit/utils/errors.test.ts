import { describe, it, expect } from 'vitest';
import { handleDatabaseError, DatabaseError, ValidationError } from '../../../src/utils/errors.js';

describe('handleDatabaseError', () => {
  it('should NOT leak raw database error messages', () => {
    const rawError = {
      message: 'Sensitive information: connection string or table structure',
      code: 'XXXXX',
    };

    try {
      handleDatabaseError(rawError);
    } catch (error) {
      expect(error).toBeInstanceOf(DatabaseError);
      expect((error as DatabaseError).message).toBe('An internal database error occurred');
      expect((error as DatabaseError).originalError).toBe(rawError);
    }
  });

  it('should handle unique constraint violation (23505)', () => {
    const rawError = {
      code: '23505',
      details: 'Key (slug)=(my-slug) already exists.',
    };

    try {
      handleDatabaseError(rawError);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toBe('A record with this slug already exists');
    }
  });

  it('should handle foreign key violation (23503)', () => {
    const rawError = {
      code: '23503',
    };

    try {
      handleDatabaseError(rawError);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toBe('Referenced entity does not exist');
    }
  });

  it('should handle check constraint violation (23514)', () => {
    const rawError = {
      code: '23514',
    };

    try {
      handleDatabaseError(rawError);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toBe('Value does not meet validation requirements');
    }
  });
});

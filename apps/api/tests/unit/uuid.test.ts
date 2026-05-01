import { describe, expect, it } from 'vitest';
import { validateUuid } from '../../src/validators/uuid.js';
import { ValidationError } from '../../src/utils/errors.js';

describe('validateUuid', () => {
  it('should not throw for a valid UUID', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(() => validateUuid(validUuid, 'testId')).not.toThrow();
  });

  it('should throw ValidationError for an invalid UUID', () => {
    const invalidUuid = 'not-a-uuid';
    expect(() => validateUuid(invalidUuid, 'testId')).toThrow(ValidationError);
    expect(() => validateUuid(invalidUuid, 'testId')).toThrow('Invalid testId format');
  });

  it('should throw ValidationError for a UUID with extra characters', () => {
    const invalidUuid = '550e8400-e29b-41d4-a716-446655440000-extra';
    expect(() => validateUuid(invalidUuid, 'testId')).toThrow(ValidationError);
  });

  it('should throw ValidationError for an empty string', () => {
    expect(() => validateUuid('', 'testId')).toThrow(ValidationError);
  });
});

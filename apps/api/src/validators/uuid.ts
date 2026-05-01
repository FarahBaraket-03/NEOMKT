import { ValidationError } from '../utils/errors.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that a string is a valid UUID.
 * Throws a ValidationError if the string is invalid.
 * @param id The string to validate.
 * @param fieldName The name of the field (used in the error message).
 */
export function validateUuid(id: string, fieldName: string): void {
  if (!UUID_REGEX.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`, fieldName);
  }
}

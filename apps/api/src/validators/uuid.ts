import { ValidationError } from '../utils/errors.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that a string is a valid UUID.
 * @param uuid The string to validate.
 * @param field The field name for the error message.
 * @throws {ValidationError} If the string is not a valid UUID.
 */
export function validateUuid(uuid: string, field = 'id'): void {
  if (!UUID_REGEX.test(uuid)) {
    throw new ValidationError(`Invalid UUID format for ${field}`, field);
  }
}

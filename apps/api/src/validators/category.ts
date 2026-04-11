import { ValidationError } from '../utils/errors.js';

interface CategoryInputBase {
  name?: string;
  slug?: string;
  description?: string | null;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 5000;

function validateCoreFields(input: CategoryInputBase, allowPartial: boolean): void {
  if (!allowPartial || input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('name is required', 'name');
    }
    if (input.name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(`name cannot exceed ${MAX_NAME_LENGTH} characters`, 'name');
    }
  }

  if (!allowPartial || input.slug !== undefined) {
    if (!input.slug || !SLUG_REGEX.test(input.slug)) {
      throw new ValidationError('slug must match /^[a-z0-9-]+$/', 'slug');
    }
  }

  if (input.description && input.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(
      `description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      'description',
    );
  }
}

export const validateCreateCategoryInput = (input: CategoryInputBase) => validateCoreFields(input, false);
export const validateUpdateCategoryInput = (input: CategoryInputBase) => validateCoreFields(input, true);

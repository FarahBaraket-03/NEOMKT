import { ValidationError } from '../utils/errors.js';

interface CategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  icon?: string | null;
}

const MAX_DESCRIPTION_LENGTH = 5000;

function validateCoreFields(input: CategoryInput): void {
  if (input.description !== undefined && input.description !== null) {
    if (input.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
        'description',
      );
    }
  }
}

export function validateCreateCategoryInput(input: CategoryInput): void {
  validateCoreFields(input);
}

export function validateUpdateCategoryInput(input: CategoryInput): void {
  validateCoreFields(input);
}

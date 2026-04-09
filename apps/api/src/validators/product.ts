import { ValidationError } from '../utils/errors.js';

interface ProductInputBase {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  slug?: string;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

function validateCoreFields(input: ProductInputBase, allowPartial: boolean): void {
  if (!allowPartial || input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('name is required', 'name');
    }
    if (input.name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(`name cannot exceed ${MAX_NAME_LENGTH} characters`, 'name');
    }
  }

  if (input.description !== undefined && input.description !== null) {
    if (input.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
        'description',
      );
    }
  }

  if (!allowPartial || input.price !== undefined) {
    if (typeof input.price !== 'number' || Number.isNaN(input.price) || input.price < 0) {
      throw new ValidationError('price must be greater than or equal to 0', 'price');
    }
  }

  if (!allowPartial || input.stock !== undefined) {
    if (typeof input.stock !== 'number' || Number.isNaN(input.stock) || input.stock < 0) {
      throw new ValidationError('stock must be greater than or equal to 0', 'stock');
    }
  }

  if (!allowPartial || input.slug !== undefined) {
    if (!input.slug || !SLUG_REGEX.test(input.slug)) {
      throw new ValidationError('slug must match /^[a-z0-9-]+$/', 'slug');
    }
  }
}

export function validateCreateProductInput(input: ProductInputBase): void {
  validateCoreFields(input, false);
}

export function validateUpdateProductInput(input: ProductInputBase): void {
  validateCoreFields(input, true);
}

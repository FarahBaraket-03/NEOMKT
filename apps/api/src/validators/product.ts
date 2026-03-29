import { ValidationError } from '../utils/errors.js';

interface ProductInputBase {
  name?: string;
  price?: number;
  stock?: number;
  slug?: string;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;

function validateCoreFields(input: ProductInputBase, allowPartial: boolean): void {
  if (!allowPartial || input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('name is required', 'name');
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

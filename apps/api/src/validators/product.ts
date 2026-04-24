import { ValidationError } from '../utils/errors.js';

interface ProductInputBase {
  name?: string;
  price?: number;
  stock?: number;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;

const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_NAME_LENGTH = 200;
const MAX_URL_LENGTH = 1000;
const MAX_IMAGES_COUNT = 10;

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateCoreFields(input: ProductInputBase, allowPartial: boolean): void {
  if (!allowPartial || input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('name is required', 'name');
    }
    if (input.name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(`name cannot exceed ${MAX_NAME_LENGTH} characters`, 'name');
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

  if (input.description !== undefined && input.description !== null) {
    if (input.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
        'description',
      );
    }
  }

  if (input.imageUrl) {
    if (input.imageUrl.length > MAX_URL_LENGTH) {
      throw new ValidationError(`imageUrl cannot exceed ${MAX_URL_LENGTH} characters`, 'imageUrl');
    }
    if (!isValidUrl(input.imageUrl)) {
      throw new ValidationError('imageUrl must be a valid HTTP or HTTPS URL', 'imageUrl');
    }
  }

  if (Array.isArray(input.images)) {
    if (input.images.length > MAX_IMAGES_COUNT) {
      throw new ValidationError(`images cannot exceed ${MAX_IMAGES_COUNT} items`, 'images');
    }
    for (let i = 0; i < input.images.length; i += 1) {
      const url = input.images[i];
      if (url.length > MAX_URL_LENGTH) {
        throw new ValidationError(`image URL at index ${i} cannot exceed ${MAX_URL_LENGTH} characters`, 'images');
      }
      if (!isValidUrl(url)) {
        throw new ValidationError(`image URL at index ${i} must be a valid HTTP or HTTPS URL`, 'images');
      }
    }
  }
}

export function validateCreateProductInput(input: ProductInputBase): void {
  validateCoreFields(input, false);
}

export function validateUpdateProductInput(input: ProductInputBase): void {
  validateCoreFields(input, true);
}

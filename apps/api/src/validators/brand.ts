import { ValidationError } from '../utils/errors.js';

export interface BrandInput {
  name?: string;
  slug?: string;
  country?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  foundedYear?: number | null;
  description?: string | null;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_DESC_LENGTH = 5000;

function validateCore(input: BrandInput, allowPartial: boolean): void {
  if (!allowPartial || input.name !== undefined) {
    if (!input.name?.trim()) throw new ValidationError('name is required', 'name');
    if (input.name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(`name cannot exceed ${MAX_NAME_LENGTH} characters`, 'name');
    }
  }
  if (!allowPartial || input.slug !== undefined) {
    if (!input.slug || !SLUG_REGEX.test(input.slug)) {
      throw new ValidationError('slug must match /^[a-z0-9-]+$/', 'slug');
    }
  }
  if (typeof input.foundedYear === 'number') {
    const cur = new Date().getFullYear();
    if (input.foundedYear < 1800 || input.foundedYear > cur) {
      throw new ValidationError('foundedYear must be between 1800 and the current year', 'foundedYear');
    }
  }
  if (input.description && input.description.length > MAX_DESC_LENGTH) {
    throw new ValidationError(`description cannot exceed ${MAX_DESC_LENGTH} characters`, 'description');
  }
}

export const validateCreateBrandInput = (i: BrandInput) => validateCore(i, false);
export const validateUpdateBrandInput = (i: BrandInput) => validateCore(i, true);

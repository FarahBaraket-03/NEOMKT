import { ValidationError } from '../utils/errors.js';

interface CreateBrandInput {
  name: string;
  slug: string;
  country?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  foundedYear?: number | null;
  description?: string | null;
}

interface UpdateBrandInput {
  name?: string | null;
  slug?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  foundedYear?: number | null;
  description?: string | null;
}

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 5000;
const SLUG_REGEX = /^[a-z0-9-]+$/;

function validateFoundedYear(year: number): void {
  const currentYear = new Date().getFullYear();
  if (year < 1800 || year > currentYear) {
    throw new ValidationError('foundedYear must be between 1800 and the current year', 'foundedYear');
  }
}

export function validateCreateBrandInput(input: CreateBrandInput): void {
  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError('name is required', 'name');
  }
  if (input.name.length > MAX_NAME_LENGTH) {
    throw new ValidationError(`name cannot exceed ${MAX_NAME_LENGTH} characters`, 'name');
  }
  if (!input.slug || !SLUG_REGEX.test(input.slug)) {
    throw new ValidationError('slug must match /^[a-z0-9-]+$/', 'slug');
  }
  if (typeof input.foundedYear === 'number') {
    validateFoundedYear(input.foundedYear);
  }
  if (input.description && input.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(`description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`, 'description');
  }
}

export function validateUpdateBrandInput(input: UpdateBrandInput): void {
  if (typeof input.name === 'string') {
    if (input.name.trim().length === 0) {
      throw new ValidationError('name cannot be empty', 'name');
    }
    if (input.name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(`name cannot exceed ${MAX_NAME_LENGTH} characters`, 'name');
    }
  }
  if (typeof input.slug === 'string') {
    if (!SLUG_REGEX.test(input.slug)) {
      throw new ValidationError('slug must match /^[a-z0-9-]+$/', 'slug');
    }
  }
  if (typeof input.foundedYear === 'number') {
    validateFoundedYear(input.foundedYear);
  }
  if (input.description && input.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(`description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`, 'description');
  }
}

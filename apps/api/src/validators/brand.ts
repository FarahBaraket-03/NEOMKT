import { ValidationError } from '../utils/errors.js';

interface BrandInput {
  name?: string | null;
  slug?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  foundedYear?: number | null;
  description?: string | null;
}

const MAX_NAME_LENGTH = 100;
const MAX_DESC_LENGTH = 5000;
const MAX_COUNTRY_LENGTH = 100;
const SLUG_REGEX = /^[a-z0-9-]+$/;
const URL_REGEX = /^(https?:\/\/|^\/)/i;

function validateCore(input: BrandInput): void {
  if (typeof input.name === 'string') {
    if (!input.name.trim()) throw new ValidationError('name cannot be empty', 'name');
    if (input.name.length > MAX_NAME_LENGTH)
      throw new ValidationError(`name cannot exceed ${MAX_NAME_LENGTH} characters`, 'name');
  }
  if (typeof input.slug === 'string' && !SLUG_REGEX.test(input.slug))
    throw new ValidationError('slug must match /^[a-z0-9-]+$/', 'slug');
  if (input.country && input.country.length > MAX_COUNTRY_LENGTH)
    throw new ValidationError(`country cannot exceed ${MAX_COUNTRY_LENGTH} characters`, 'country');
  if (input.logoUrl && !URL_REGEX.test(input.logoUrl))
    throw new ValidationError('Invalid logoUrl scheme', 'logoUrl');
  if (input.websiteUrl && !URL_REGEX.test(input.websiteUrl))
    throw new ValidationError('Invalid websiteUrl scheme', 'websiteUrl');
  if (typeof input.foundedYear === 'number') {
    const currentYear = new Date().getFullYear();
    if (input.foundedYear < 1800 || input.foundedYear > currentYear)
      throw new ValidationError('foundedYear must be between 1800 and the current year', 'foundedYear');
  }
  if (input.description && input.description.length > MAX_DESC_LENGTH)
    throw new ValidationError(`description cannot exceed ${MAX_DESC_LENGTH} characters`, 'description');
}

export function validateCreateBrandInput(input: BrandInput): void {
  if (!input.name?.trim()) throw new ValidationError('name is required', 'name');
  if (!input.slug) throw new ValidationError('slug is required', 'slug');
  validateCore(input);
}

export function validateUpdateBrandInput(input: BrandInput): void {
  validateCore(input);
}

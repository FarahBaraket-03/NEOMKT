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
const MAX_URL_LENGTH = 1000;
const MAX_COUNTRY_LENGTH = 100;

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

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
  if (input.country && input.country.length > MAX_COUNTRY_LENGTH) {
    throw new ValidationError(`country cannot exceed ${MAX_COUNTRY_LENGTH} characters`, 'country');
  }
  if (input.logoUrl) {
    if (input.logoUrl.length > MAX_URL_LENGTH) {
      throw new ValidationError(`logoUrl cannot exceed ${MAX_URL_LENGTH} characters`, 'logoUrl');
    }
    if (!isValidUrl(input.logoUrl)) {
      throw new ValidationError('logoUrl must be a valid HTTP or HTTPS URL', 'logoUrl');
    }
  }
  if (input.websiteUrl) {
    if (input.websiteUrl.length > MAX_URL_LENGTH) {
      throw new ValidationError(`websiteUrl cannot exceed ${MAX_URL_LENGTH} characters`, 'websiteUrl');
    }
    if (!isValidUrl(input.websiteUrl)) {
      throw new ValidationError('websiteUrl must be a valid HTTP or HTTPS URL', 'websiteUrl');
    }
  }
}

export const validateCreateBrandInput = (i: BrandInput) => validateCore(i, false);
export const validateUpdateBrandInput = (i: BrandInput) => validateCore(i, true);

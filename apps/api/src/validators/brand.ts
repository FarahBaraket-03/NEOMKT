import { ValidationError } from '../utils/errors.js';

interface CreateBrandInput {
  name: string;
  foundedYear?: number | null;
}

interface UpdateBrandInput {
  name?: string | null;
  foundedYear?: number | null;
}

const MAX_NAME_LENGTH = 100;

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
  if (typeof input.foundedYear === 'number') {
    validateFoundedYear(input.foundedYear);
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
  if (typeof input.foundedYear === 'number') {
    validateFoundedYear(input.foundedYear);
  }
}

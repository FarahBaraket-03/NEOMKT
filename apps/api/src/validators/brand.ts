import { ValidationError } from '../utils/errors.js';

interface CreateBrandInput {
  name: string;
  foundedYear?: number | null;
}

interface UpdateBrandInput {
  name?: string | null;
  foundedYear?: number | null;
}

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
  if (typeof input.foundedYear === 'number') {
    validateFoundedYear(input.foundedYear);
  }
}

export function validateUpdateBrandInput(input: UpdateBrandInput): void {
  if (typeof input.name === 'string' && input.name.trim().length === 0) {
    throw new ValidationError('name cannot be empty', 'name');
  }
  if (typeof input.foundedYear === 'number') {
    validateFoundedYear(input.foundedYear);
  }
}

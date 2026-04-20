import { ValidationError } from '../utils/errors.js';

interface ProductSpecInputBase {
  productId?: string;
  key?: string;
  value?: string;
  unit?: string | null;
  displayOrder?: number;
}

const MAX_KEY_LENGTH = 100;
const MAX_VALUE_LENGTH = 1000;
const MAX_UNIT_LENGTH = 50;

function validateCoreFields(input: ProductSpecInputBase, allowPartial: boolean): void {
  if (!allowPartial || input.productId !== undefined) {
    if (!input.productId || input.productId.trim().length === 0) {
      throw new ValidationError('productId is required', 'productId');
    }
  }

  if (!allowPartial || input.key !== undefined) {
    if (!input.key || input.key.trim().length === 0) {
      throw new ValidationError('key is required', 'key');
    }
    if (input.key.length > MAX_KEY_LENGTH) {
      throw new ValidationError(`key cannot exceed ${MAX_KEY_LENGTH} characters`, 'key');
    }
  }

  if (!allowPartial || input.value !== undefined) {
    if (!input.value || input.value.trim().length === 0) {
      throw new ValidationError('value is required', 'value');
    }
    if (input.value.length > MAX_VALUE_LENGTH) {
      throw new ValidationError(`value cannot exceed ${MAX_VALUE_LENGTH} characters`, 'value');
    }
  }

  if (input.unit !== undefined && input.unit !== null) {
    if (input.unit.length > MAX_UNIT_LENGTH) {
      throw new ValidationError(`unit cannot exceed ${MAX_UNIT_LENGTH} characters`, 'unit');
    }
  }

  if (input.displayOrder !== undefined) {
    if (!Number.isInteger(input.displayOrder) || input.displayOrder < 0) {
      throw new ValidationError('displayOrder must be a non-negative integer', 'displayOrder');
    }
  }
}

export function validateCreateProductSpecInput(input: ProductSpecInputBase): void {
  validateCoreFields(input, false);
}

export function validateUpdateProductSpecInput(input: ProductSpecInputBase): void {
  validateCoreFields(input, true);
}

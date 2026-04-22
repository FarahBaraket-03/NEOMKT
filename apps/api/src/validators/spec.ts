import { ValidationError } from '../utils/errors.js';

export interface ProductSpecInput {
  productId?: string;
  key?: string;
  value?: string;
  unit?: string | null;
  displayOrder?: number;
}

const v = (i: ProductSpecInput, p: boolean) => {
  if ((!p || i.productId !== undefined) && !i.productId?.trim()) throw new ValidationError('productId required', 'productId');
  if ((!p || i.key !== undefined) && (!i.key?.trim() || i.key.length > 100)) throw new ValidationError('invalid key', 'key');
  if ((!p || i.value !== undefined) && (!i.value?.trim() || i.value.length > 1000)) throw new ValidationError('invalid value', 'value');
  if (i.unit && i.unit.length > 50) throw new ValidationError('unit too long', 'unit');
  if (i.displayOrder !== undefined && (i.displayOrder < 0 || !Number.isInteger(i.displayOrder))) throw new ValidationError('invalid displayOrder', 'displayOrder');
};

export const validateCreateProductSpecInput = (i: ProductSpecInput) => v(i, false);
export const validateUpdateProductSpecInput = (i: ProductSpecInput) => v(i, true);

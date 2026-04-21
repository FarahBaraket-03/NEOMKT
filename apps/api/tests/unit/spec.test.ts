import { describe, expect, it } from 'vitest';
import {
  validateCreateProductSpecInput,
  validateUpdateProductSpecInput,
} from '../../src/validators/spec.js';

describe('ProductSpec Validator', () => {
  describe('validateCreateProductSpecInput', () => {
    it('accepts valid input', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'prod-123',
          key: 'Battery',
          value: '5000',
          unit: 'mAh',
          displayOrder: 1,
        }),
      ).not.toThrow();
    });

    it('rejects missing productId', () => {
      expect(() =>
        validateCreateProductSpecInput({
          key: 'Battery',
          value: '5000',
        } as any),
      ).toThrow(/productId is required/);
    });

    it('rejects missing key', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'prod-123',
          value: '5000',
        } as any),
      ).toThrow(/key is required/);
    });

    it('rejects overly long key', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'prod-123',
          key: 'a'.repeat(101),
          value: '5000',
        }),
      ).toThrow(/key cannot exceed 100 characters/);
    });

    it('rejects missing value', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'prod-123',
          key: 'Battery',
        } as any),
      ).toThrow(/value is required/);
    });

    it('rejects overly long value', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'prod-123',
          key: 'Battery',
          value: 'a'.repeat(1001),
        }),
      ).toThrow(/value cannot exceed 1000 characters/);
    });

    it('rejects overly long unit', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'prod-123',
          key: 'Battery',
          value: '5000',
          unit: 'a'.repeat(51),
        }),
      ).toThrow(/unit cannot exceed 50 characters/);
    });

    it('rejects negative displayOrder', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'prod-123',
          key: 'Battery',
          value: '5000',
          displayOrder: -1,
        }),
      ).toThrow(/displayOrder must be a non-negative integer/);
    });

    it('rejects non-integer displayOrder', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'prod-123',
          key: 'Battery',
          value: '5000',
          displayOrder: 1.5,
        }),
      ).toThrow(/displayOrder must be a non-negative integer/);
    });
  });

  describe('validateUpdateProductSpecInput', () => {
    it('allows partial update', () => {
      expect(() =>
        validateUpdateProductSpecInput({
          value: '6000',
        }),
      ).not.toThrow();
    });

    it('rejects invalid key if provided', () => {
      expect(() =>
        validateUpdateProductSpecInput({
          key: 'a'.repeat(101),
        }),
      ).toThrow(/key cannot exceed 100 characters/);
    });
  });
});

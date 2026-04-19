import { describe, expect, it } from 'vitest';
import { validateCreateProductInput } from '../../src/validators/product.js';
import { validateCreateReviewInput } from '../../src/validators/review.js';
import { validateCreateBrandInput } from '../../src/validators/brand.js';
import { validateCreateCategoryInput } from '../../src/validators/category.js';
import { validateCreateProductSpecInput } from '../../src/validators/spec.js';

describe('validators', () => {
  describe('Product', () => {
    it('rejects negative product price', () => {
      expect(() =>
        validateCreateProductInput({
          name: 'x',
          slug: 'valid-slug',
          price: -1,
          stock: 2,
        }),
      ).toThrow();
    });

    it('rejects overly long name', () => {
      expect(() =>
        validateCreateProductInput({
          name: 'a'.repeat(201),
          slug: 'valid-slug',
          price: 10,
          stock: 2,
        }),
      ).toThrow(/name cannot exceed/);
    });
  });

  describe('Review', () => {
    it('rejects invalid review rating', () => {
      expect(() =>
        validateCreateReviewInput({
          rating: 8,
          comment: 'bad',
        }),
      ).toThrow();
    });
  });

  describe('Brand', () => {
    it('accepts valid brand input', () => {
      expect(() =>
        validateCreateBrandInput({
          name: 'Test',
          slug: 'test-brand',
          foundedYear: 2000,
        }),
      ).not.toThrow();
    });

    it('rejects overly long name', () => {
      expect(() =>
        validateCreateBrandInput({
          name: 'a'.repeat(101),
          slug: 'test-brand',
        }),
      ).toThrow(/name cannot exceed 100 characters/);
    });

    it('rejects invalid slug', () => {
      expect(() =>
        validateCreateBrandInput({
          name: 'Test',
          slug: 'Invalid Slug!',
        }),
      ).toThrow(/slug must match/);
    });

    it('rejects overly long description', () => {
      expect(() =>
        validateCreateBrandInput({
          name: 'Test',
          slug: 'test-brand',
          description: 'a'.repeat(5001),
        }),
      ).toThrow(/description cannot exceed 5000 characters/);
    });
  });

  describe('Category', () => {
    it('accepts valid category input', () => {
      expect(() =>
        validateCreateCategoryInput({
          name: 'Laptops',
          slug: 'laptops',
        }),
      ).not.toThrow();
    });

    it('rejects invalid slug', () => {
      expect(() =>
        validateCreateCategoryInput({
          name: 'Laptops',
          slug: 'Laptops!',
        }),
      ).toThrow(/slug must match/);
    });

    it('rejects overly long name', () => {
      expect(() =>
        validateCreateCategoryInput({
          name: 'a'.repeat(101),
          slug: 'valid-slug',
        }),
      ).toThrow(/name cannot exceed 100 characters/);
    });
  });

  it('rejects overly long product description', () => {
    expect(() =>
      validateCreateProductInput({
        name: 'x',
        slug: 'valid-slug',
        price: 10,
        stock: 2,
        description: 'a'.repeat(5001),
      }),
    ).toThrow(/description cannot exceed 5000 characters/);
  });

  describe('ProductSpec', () => {
    it('accepts valid product spec input', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'p1',
          key: 'Battery',
          value: '5000mAh',
          displayOrder: 1,
        }),
      ).not.toThrow();
    });

    it('rejects missing productId', () => {
      expect(() =>
        validateCreateProductSpecInput({
          key: 'Battery',
          value: '5000mAh',
        }),
      ).toThrow(/productId is required/);
    });

    it('rejects overly long key', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'p1',
          key: 'a'.repeat(101),
          value: 'v',
        }),
      ).toThrow(/key cannot exceed 100 characters/);
    });

    it('rejects overly long value', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'p1',
          key: 'k',
          value: 'a'.repeat(1001),
        }),
      ).toThrow(/value cannot exceed 1000 characters/);
    });

    it('rejects overly long unit', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'p1',
          key: 'k',
          value: 'v',
          unit: 'a'.repeat(51),
        }),
      ).toThrow(/unit cannot exceed 50 characters/);
    });

    it('rejects negative displayOrder', () => {
      expect(() =>
        validateCreateProductSpecInput({
          productId: 'p1',
          key: 'k',
          value: 'v',
          displayOrder: -1,
        }),
      ).toThrow(/displayOrder must be a non-negative integer/);
    });
  });
});

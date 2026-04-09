import { describe, expect, it } from 'vitest';
import { validateCreateProductInput } from '../../src/validators/product.js';
import { validateCreateReviewInput } from '../../src/validators/review.js';
import { validateCreateBrandInput } from '../../src/validators/brand.js';

describe('validators', () => {
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

  it('rejects invalid review rating', () => {
    expect(() =>
      validateCreateReviewInput({
        rating: 8,
        comment: 'bad',
      }),
    ).toThrow();
  });

  it('accepts valid brand input', () => {
    expect(() =>
      validateCreateBrandInput({
        name: 'Test',
        foundedYear: 2000,
      }),
    ).not.toThrow();
  });

  it('rejects product name exceeding 200 characters', () => {
    expect(() =>
      validateCreateProductInput({
        name: 'a'.repeat(201),
        slug: 'test-slug',
        price: 100,
        stock: 10,
      }),
    ).toThrow(/name cannot exceed 200 characters/);
  });

  it('rejects product description exceeding 2000 characters', () => {
    expect(() =>
      validateCreateProductInput({
        name: 'Valid Name',
        description: 'a'.repeat(2001),
        slug: 'test-slug',
        price: 100,
        stock: 10,
      }),
    ).toThrow(/description cannot exceed 2000 characters/);
  });
});

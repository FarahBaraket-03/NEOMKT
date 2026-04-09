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
});

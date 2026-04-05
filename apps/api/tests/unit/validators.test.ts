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

  it('rejects overly long review title', () => {
    expect(() =>
      validateCreateReviewInput({
        rating: 5,
        title: 'a'.repeat(101),
        comment: 'This is a valid comment length.',
      }),
    ).toThrow(/title cannot exceed 100 characters/);
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
});

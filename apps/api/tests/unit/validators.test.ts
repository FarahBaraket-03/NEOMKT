import { describe, expect, it } from 'vitest';
import { validateCreateProductInput } from '../../src/validators/product.js';
import { validateCreateReviewInput } from '../../src/validators/review.js';
import { validateCreateBrandInput } from '../../src/validators/brand.js';
import { validateCreateCategoryInput } from '../../src/validators/category.js';

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

    it('rejects invalid imageUrl', () => {
      expect(() =>
        validateCreateProductInput({
          name: 'x',
          slug: 'valid-slug',
          price: 10,
          stock: 2,
          imageUrl: 'not-a-url',
        }),
      ).toThrow(/imageUrl must be a valid HTTP or HTTPS URL/);
    });

    it('rejects invalid URL in images array', () => {
      expect(() =>
        validateCreateProductInput({
          name: 'x',
          slug: 'valid-slug',
          price: 10,
          stock: 2,
          images: ['https://valid.com', 'ftp://invalid.com'],
        }),
      ).toThrow(/image URL at index 1 must be a valid HTTP or HTTPS URL/);
    });

    it('rejects too many images', () => {
      expect(() =>
        validateCreateProductInput({
          name: 'x',
          slug: 'valid-slug',
          price: 10,
          stock: 2,
          images: Array(11).fill('https://valid.com'),
        }),
      ).toThrow(/images cannot exceed 10 items/);
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

    it('rejects overly long title', () => {
      expect(() =>
        validateCreateReviewInput({
          rating: 5,
          comment: 'This is a valid comment',
          title: 'a'.repeat(201),
        }),
      ).toThrow(/title cannot exceed 200 characters/);
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

    it('rejects invalid websiteUrl', () => {
      expect(() =>
        validateCreateBrandInput({
          name: 'Test',
          slug: 'test-brand',
          websiteUrl: 'javascript:alert(1)',
        }),
      ).toThrow(/websiteUrl must be a valid HTTP or HTTPS URL/);
    });

    it('rejects overly long country', () => {
      expect(() =>
        validateCreateBrandInput({
          name: 'Test',
          slug: 'test-brand',
          country: 'a'.repeat(101),
        }),
      ).toThrow(/country cannot exceed 100 characters/);
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

    it('rejects overly long icon', () => {
      expect(() =>
        validateCreateCategoryInput({
          name: 'Laptops',
          slug: 'laptops',
          icon: 'a'.repeat(101),
        }),
      ).toThrow(/icon cannot exceed 100 characters/);
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
});

import fc from 'fast-check';

export const slugArbitrary = fc
  .stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), {
    minLength: 3,
    maxLength: 24,
  })
  .filter((slug) => /^[a-z0-9-]+$/.test(slug));

export const brandArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 32 }),
  slug: slugArbitrary,
});

export const productArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 64 }),
  slug: slugArbitrary,
  price: fc.double({ min: 0, max: 10000, noNaN: true, noDefaultInfinity: true }),
  stock: fc.integer({ min: 0, max: 1000 }),
  status: fc.constantFrom('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK'),
  brandId: fc.uuid(),
  categoryId: fc.uuid(),
  createdAt: fc.date().map((date) => date.toISOString()),
});

export const reviewArbitrary = fc.record({
  id: fc.uuid(),
  productId: fc.uuid(),
  userId: fc.uuid(),
  rating: fc.integer({ min: 1, max: 5 }),
  comment: fc.string({ minLength: 1, maxLength: 2000 }),
  createdAt: fc.date().map((date) => date.toISOString()),
});

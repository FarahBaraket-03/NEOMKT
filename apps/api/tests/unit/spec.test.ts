import { describe, expect, it } from 'vitest';
import { validateCreateProductSpecInput as v } from '../../src/validators/spec.js';

describe('Spec Validator', () => {
  it('accepts valid', () => expect(() => v({ productId: '1', key: 'k', value: 'v' })).not.toThrow());
  it('rejects missing id', () => expect(() => v({ key: 'k', value: 'v' } as any)).toThrow());
  it('rejects long key', () => expect(() => v({ productId: '1', key: 'a'.repeat(101), value: 'v' })).toThrow());
  it('rejects negative order', () => expect(() => v({ productId: '1', key: 'k', value: 'v', displayOrder: -1 })).toThrow());
});

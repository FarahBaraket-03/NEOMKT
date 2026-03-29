import { describe, expect, it } from 'vitest';

describe('e2e smoke', () => {
  it('basic arithmetic sanity', () => {
    expect(1 + 1).toBe(2);
  });
});

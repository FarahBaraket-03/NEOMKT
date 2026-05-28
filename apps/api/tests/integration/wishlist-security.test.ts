import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

// Mock the context creation to inject our mock supabase
vi.mock('../../src/lib/context.js', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
  };

  return {
    createContext: vi.fn().mockReturnValue({
      supabase: mockSupabase,
      user: { id: '00000000-0000-0000-0000-000000000001', role: 'USER' },
      dataloaders: {},
    }),
    createWsContext: vi.fn(),
  };
});

// We need a way to access the mock inside tests.
// Since vi.mock is hoisted, we can import the mocked module and access the mock.
import { createContext } from '../../src/lib/context.js';

describe('Wishlist Security', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = (createContext as any)().supabase;
    // Reset all methods on the mock
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.gte.mockReturnThis();
    mockSupabase.insert.mockReturnThis();
    mockSupabase.order.mockReturnThis();
  });

  it('should enforce rate limiting on addToWishlist', async () => {
    // 1. Mock first check (existing item) -> not found
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    // 2. Mock rate limit check -> return 10 items (limit reached)
    mockSupabase.gte.mockResolvedValueOnce({ count: 10, error: null });

    const mutation = `
      mutation AddToWishlist($productId: ID!) {
        addToWishlist(productId: $productId) {
          id
        }
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .set('apollo-require-preflight', 'true')
      .send({
        query: mutation,
        variables: { productId: '00000000-0000-0000-0000-000000000002' },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('You can add up to 10 items to your wishlist per hour.');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('should allow adding to wishlist if under limit', async () => {
    // 1. Mock first check (existing item) -> not found
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    // 2. Mock rate limit check -> return 5 items (under limit)
    mockSupabase.gte.mockResolvedValueOnce({ count: 5, error: null });

    // 3. Mock insert
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'item-1', user_id: 'u1', product_id: 'p1', added_at: new Date().toISOString() },
      error: null
    });

    const mutation = `
      mutation AddToWishlist($productId: ID!) {
        addToWishlist(productId: $productId) {
          id
        }
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .set('apollo-require-preflight', 'true')
      .send({
        query: mutation,
        variables: { productId: '00000000-0000-0000-0000-000000000002' },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.addToWishlist.id).toBe('item-1');
  });
});

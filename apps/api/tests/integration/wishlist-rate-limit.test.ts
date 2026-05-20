import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import * as authMiddleware from '../../src/middleware/auth.js';

const { mockSupabaseClient } = vi.hoisted(() => {
  const mockClient: any = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    maybeSingle: vi.fn(),
    insert: vi.fn(),
    single: vi.fn(),
    order: vi.fn(),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockResolvedValue({}),
    }),
  };

  mockClient.from.mockReturnValue(mockClient);
  mockClient.select.mockReturnValue(mockClient);
  mockClient.eq.mockReturnValue(mockClient);
  mockClient.gte.mockReturnValue(mockClient);
  mockClient.insert.mockReturnValue(mockClient);
  mockClient.order.mockReturnValue(mockClient);

  return { mockSupabaseClient: mockClient };
});

vi.mock('../../src/lib/supabase.js', async () => {
  return {
    createUserClient: vi.fn(() => mockSupabaseClient),
    supabaseAdmin: mockSupabaseClient,
    checkDatabaseHealth: vi.fn().mockResolvedValue(true),
  };
});

describe('Wishlist Rate Limit Integration', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'USER' as const,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(authMiddleware, 'authenticateToken').mockResolvedValue(mockUser);

    // Reset defaults and setup fluents for every test
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.gte.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.order.mockReturnValue(mockSupabaseClient);

    mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
  });

  it('should allow adding to wishlist within limit', async () => {
    // First call to check rate limit
    mockSupabaseClient.select.mockReturnValueOnce(mockSupabaseClient);
    mockSupabaseClient.eq.mockReturnValueOnce(mockSupabaseClient);
    mockSupabaseClient.gte.mockReturnValueOnce({
        count: 0,
        error: null
    });

    // Second call to check if existing
    mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
    });

    // Third call to insert
    mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'item-1', user_id: mockUser.id, product_id: 'prod-1', added_at: new Date().toISOString() },
        error: null
    });

    const mutation = `
      mutation AddToWishlist($productId: ID!) {
        addToWishlist(productId: $productId) {
          id
          productId
        }
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer mock-token')
      .send({
        query: mutation,
        variables: { productId: 'prod-1' }
      });

    expect(response.status).toBe(200);
    expect(response.body.data.addToWishlist.productId).toBe('prod-1');
  });

  it('should block adding to wishlist when limit is reached', async () => {
    // Call to check rate limit
    mockSupabaseClient.select.mockReturnValueOnce(mockSupabaseClient);
    mockSupabaseClient.eq.mockReturnValueOnce(mockSupabaseClient);
    mockSupabaseClient.gte.mockReturnValueOnce({
        count: 10,
        error: null
    });

    const mutation = `
      mutation AddToWishlist($productId: ID!) {
        addToWishlist(productId: $productId) {
          id
          productId
        }
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer mock-token')
      .send({
        query: mutation,
        variables: { productId: 'prod-excess' }
      });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('You can add up to 10 items to your wishlist per hour.');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});

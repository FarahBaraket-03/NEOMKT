import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { pubsub } from './pubsub.js';
import type { ProductRow, ReviewRow } from './models.js';
import { mapProduct, mapReview } from './mappers.js';

const channels: RealtimeChannel[] = [];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function initRealtime(supabase: SupabaseClient): Promise<void> {
  const productChannel = supabase
    .channel('products-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      async (payload) => {
        const rawRecord =
          payload.eventType === 'DELETE' ? payload.old : payload.new;

        if (!isRecord(rawRecord)) {
          return;
        }

        const product = mapProduct(rawRecord as unknown as ProductRow);
        await pubsub.publish('PRODUCT_UPDATED', product);

        if (payload.eventType === 'INSERT') {
          await pubsub.publish('PRODUCT_STOCK_CHANGED', { productStockChanged: product });
          return;
        }

        if (payload.eventType === 'UPDATE' && isRecord(payload.old)) {
          const oldStock = Number((payload.old as Record<string, unknown>).stock ?? 0);
          if (oldStock !== product.stock) {
            await pubsub.publish('PRODUCT_STOCK_CHANGED', {
              productStockChanged: product,
            });
          }
        }
      },
    )
    .subscribe();

  const reviewChannel = supabase
    .channel('reviews-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reviews' },
      async (payload) => {
        if (!isRecord(payload.new)) {
          return;
        }

        const review = mapReview(payload.new as unknown as ReviewRow);
        await pubsub.publish('REVIEW_ADDED', { reviewAdded: review });
      },
    )
    .subscribe();

  channels.push(productChannel, reviewChannel);
}

export async function cleanupRealtime(): Promise<void> {
  await Promise.all(channels.map((channel) => channel.unsubscribe()));
  channels.length = 0;
}

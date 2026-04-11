'use client';

import { useEffect, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  GET_USER_WISHLIST,
  PRICE_UPDATED_SUBSCRIPTION,
  PRODUCT_STOCK_CHANGED_SUBSCRIPTION,
} from '@/gql/documents';
import { useLiveCatalog } from './LiveCatalogContext';

interface WishlistQueryData {
  wishlist: Array<{
    productId: string;
  }>;
}

interface ProductStockChangedPayload {
  productStockChanged?: {
    id: string;
    name: string;
    slug: string;
    stock: number;
    price: number;
    status: 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
  } | null;
}

interface PriceUpdatedPayload {
  priceUpdated?: {
    oldPrice: number;
    newPrice: number;
    product: {
      id: string;
      name: string;
      slug: string;
      stock: number;
      price: number;
      status: 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
    };
  } | null;
}

function toWishlistIds(data: WishlistQueryData | undefined): Set<string> {
  return new Set((data?.wishlist ?? []).map((item) => item.productId));
}

export default function WishlistProductUpdatesSubscription() {
  const { user } = useAuth();
  const { productsById, publishLiveEvent } = useLiveCatalog();
  const client = useApolloClient();
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(new Set());
  const lastEventKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setWishlistProductIds(new Set());
      return;
    }

    const observable = client.watchQuery<WishlistQueryData>({
      query: GET_USER_WISHLIST,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    });

    const subscription = observable.subscribe({
      next: ({ data }) => {
        setWishlistProductIds(toWishlistIds(data));
      },
      error: () => {
        setWishlistProductIds(new Set());
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, user]);

  useEffect(() => {
    if (!user || wishlistProductIds.size === 0) {
      return;
    }

    const stockObservable = client.subscribe<ProductStockChangedPayload>({
      query: PRODUCT_STOCK_CHANGED_SUBSCRIPTION,
    });

    const stockSubscription = stockObservable.subscribe({
      next: ({ data }) => {
        const updatedProduct = data?.productStockChanged;
        if (!updatedProduct || !wishlistProductIds.has(updatedProduct.id)) {
          return;
        }

        const eventKey = `stock:${updatedProduct.id}:${updatedProduct.stock}`;
        if (lastEventKeyRef.current === eventKey) {
          return;
        }
        lastEventKeyRef.current = eventKey;

        const previous = productsById[updatedProduct.id];

        publishLiveEvent({
          kind: 'STOCK_UPDATE',
          product: updatedProduct,
          oldValue: previous?.stock ?? updatedProduct.stock,
          newValue: updatedProduct.stock,
        });
      },
    });

    const priceObservable = client.subscribe<PriceUpdatedPayload>({
      query: PRICE_UPDATED_SUBSCRIPTION,
    });

    const priceSubscription = priceObservable.subscribe({
      next: ({ data }) => {
        const payload = data?.priceUpdated;
        const updatedProduct = payload?.product;

        if (!payload || !updatedProduct || !wishlistProductIds.has(updatedProduct.id)) {
          return;
        }

        const eventKey = `price:${updatedProduct.id}:${payload.newPrice}`;
        if (lastEventKeyRef.current === eventKey) {
          return;
        }
        lastEventKeyRef.current = eventKey;

        publishLiveEvent({
          kind: 'PRICE_UPDATE',
          product: updatedProduct,
          oldValue: payload.oldPrice,
          newValue: payload.newPrice,
        });
      },
    });

    return () => {
      stockSubscription.unsubscribe();
      priceSubscription.unsubscribe();
    };
  }, [client, productsById, publishLiveEvent, user, wishlistProductIds]);

  return null;
}

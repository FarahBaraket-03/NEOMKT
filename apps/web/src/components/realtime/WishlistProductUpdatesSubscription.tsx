'use client';

import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import {
  GET_USER_WISHLIST,
  PRODUCT_UPDATED_SUBSCRIPTION,
} from '@/gql/documents';

interface WishlistQueryData {
  wishlist: Array<{
    productId: string;
  }>;
}

interface ProductUpdatedPayload {
  productUpdated?: {
    id: string;
    name: string;
  } | null;
}

function toWishlistIds(data: WishlistQueryData | undefined): Set<string> {
  return new Set((data?.wishlist ?? []).map((item) => item.productId));
}

export default function WishlistProductUpdatesSubscription() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const client = useApolloClient();
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(new Set());

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

    const observable = client.subscribe<ProductUpdatedPayload>({
      query: PRODUCT_UPDATED_SUBSCRIPTION,
    });

    const subscription = observable.subscribe({
      next: ({ data }) => {
        const updatedProduct = data?.productUpdated;
        if (!updatedProduct || !wishlistProductIds.has(updatedProduct.id)) {
          return;
        }

        pushToast({
          title: 'WISHLIST LIVE SIGNAL',
          description: `${updatedProduct.name} received an update.`,
          variant: 'info',
        });

        void client.refetchQueries({ include: 'active' });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, pushToast, user, wishlistProductIds]);

  return null;
}

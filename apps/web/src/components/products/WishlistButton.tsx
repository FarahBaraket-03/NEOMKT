'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import {
  ADD_TO_WISHLIST,
  GET_USER_WISHLIST,
  IS_PRODUCT_WISHLISTED,
  REMOVE_FROM_WISHLIST,
} from '@/gql/documents';

export default function WishlistButton({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { pushToast } = useToast();

  const { data, loading: isLoadingWishlistState, refetch } = useQuery(IS_PRODUCT_WISHLISTED, {
    variables: { productId },
    skip: !user,
    fetchPolicy: 'network-only',
  });

  const [addToWishlist, { loading: isAdding }] = useMutation(ADD_TO_WISHLIST, {
    refetchQueries: [IS_PRODUCT_WISHLISTED, GET_USER_WISHLIST],
  });
  const [removeFromWishlist, { loading: isRemoving }] = useMutation(REMOVE_FROM_WISHLIST, {
    refetchQueries: [IS_PRODUCT_WISHLISTED, GET_USER_WISHLIST],
  });

  const isWishlisted = Boolean(data?.isProductWishlisted);

  if (!user) {
    return (
      <Link href="/auth/login" className="w-full sm:w-1/3">
        <Button variant="outline" size="lg" className="w-full gap-2 font-bold tracking-widest text-mutedForeground border-border hover:border-accent">
          <Heart className="w-5 h-5" /> LOGIN_FOR_WISHLIST
        </Button>
      </Link>
    );
  }

  const isMutating = isAdding || isRemoving || isLoadingWishlistState;

  const toggleWishlist = async () => {
    if (isMutating) {
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist({ variables: { productId } });
        pushToast({
          title: 'WISHLIST SYNC // REMOVED',
          description: 'Item removed from your wishlist.',
          variant: 'info',
        });
      } else {
        await addToWishlist({ variables: { productId } });
        pushToast({
          title: 'WISHLIST SYNC // ADDED',
          description: 'Item saved to your wishlist.',
          variant: 'success',
        });
      }

      await refetch();
    } catch (error) {
      pushToast({
        title: 'WISHLIST ERROR',
        description: (error as Error).message,
        variant: 'error',
      });
    }
  };

  return (
    <Button
      variant={isWishlisted ? 'secondary' : 'outline'}
      size="lg"
      className="w-full sm:w-1/3 gap-2 font-bold tracking-widest text-mutedForeground border-border hover:border-accent"
      onClick={() => {
        void toggleWishlist();
      }}
      isLoading={isMutating}
    >
      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
      {isWishlisted ? 'IN_WISHLIST' : 'WISH_LIST'}
    </Button>
  );
}

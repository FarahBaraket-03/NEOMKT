'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Heart, PackageX } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SmartImage from '@/components/ui/SmartImage';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatPrice, truncate } from '@/lib/format';
import { GET_USER_WISHLIST, REMOVE_FROM_WISHLIST } from '@/gql/documents';

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
  imageUrl?: string | null;
}

interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product: WishlistProduct;
}

interface WishlistQueryData {
  wishlist: WishlistItem[];
}

function statusVariant(status: WishlistProduct['status']): 'default' | 'destructive' | 'muted' {
  if (status === 'ACTIVE') {
    return 'default';
  }

  if (status === 'OUT_OF_STOCK') {
    return 'destructive';
  }

  return 'muted';
}

export default function WishlistPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { pushToast } = useToast();
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);

  const { data, loading: isLoadingWishlist } = useQuery<WishlistQueryData>(GET_USER_WISHLIST, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const [removeFromWishlist] = useMutation(REMOVE_FROM_WISHLIST, {
    refetchQueries: [GET_USER_WISHLIST],
  });

  const wishlistItems = data?.wishlist ?? [];

  const handleRemove = async (productId: string) => {
    setRemovingProductId(productId);

    try {
      await removeFromWishlist({
        variables: { productId },
      });

      pushToast({
        title: 'WISHLIST SYNC // REMOVED',
        description: 'Item removed from your wishlist.',
        variant: 'info',
      });
    } catch (error) {
      pushToast({
        title: 'WISHLIST ERROR',
        description: (error as Error).message,
        variant: 'error',
      });
    } finally {
      setRemovingProductId(null);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-8 animate-in fade-in duration-500 py-8">
        <div className="border-b border-border pb-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-[0.1em] sm:tracking-widest text-shadow-neon font-orbitron text-accent break-words">
            WISHLIST_FEED
          </h1>
          <p className="text-mutedForeground font-mono mt-2 uppercase tracking-widest">
            // SAVED_PRODUCTS_ARCHIVE
            <span className="ml-2 inline-block animate-blink text-accent">_</span>
          </p>
        </div>

        {isAuthLoading ? (
          <Card variant="terminal">
            <CardContent className="pt-10">
              <p className="font-mono text-sm text-mutedForeground uppercase tracking-widest">
                // VERIFYING_USER_SESSION...
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isAuthLoading && !user ? (
          <Card variant="terminal">
            <CardContent className="pt-10 space-y-4">
              <p className="font-mono text-sm text-mutedForeground uppercase tracking-widest">
                // AUTH_REQUIRED_TO_ACCESS_WISHLIST
              </p>
              <Link href="/auth/login" className="inline-flex">
                <Button variant="outline" size="md" className="gap-2">
                  <Heart className="w-4 h-4" />
                  LOGIN_FOR_WISHLIST
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {!isAuthLoading && user && isLoadingWishlist ? (
          <Card variant="terminal">
            <CardContent className="pt-10">
              <p className="font-mono text-sm text-mutedForeground uppercase tracking-widest">
                // LOADING_WISHLIST_ITEMS...
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isAuthLoading && user && !isLoadingWishlist && wishlistItems.length === 0 ? (
          <Card variant="terminal">
            <CardContent className="pt-10 space-y-4">
              <div className="flex items-center gap-2 text-mutedForeground">
                <PackageX className="w-4 h-4" />
                <p className="font-mono text-sm uppercase tracking-widest">// WISHLIST_EMPTY</p>
              </div>
              <Link href="/products" className="inline-flex">
                <Button variant="default" size="md">BROWSE_PRODUCTS</Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {!isAuthLoading && user && !isLoadingWishlist && wishlistItems.length > 0 ? (
          <div className="space-y-6">
            <p className="font-sharetech text-xs uppercase tracking-[0.2em] text-accentTertiary">
              {wishlistItems.length} ITEM(S) TRACKED
            </p>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} variant="holographic" className="flex flex-col h-full overflow-hidden">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <Badge variant={statusVariant(item.product.status)}>{item.product.status}</Badge>
                    <span className="font-sharetech text-[10px] uppercase tracking-[0.2em] text-mutedForeground">
                      {formatDate(item.addedAt)}
                    </span>
                  </CardHeader>

                  <div className="relative h-44 w-full border-y border-border bg-black/40 overflow-hidden">
                    <SmartImage
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>

                  <CardContent className="pt-5 flex-1 space-y-3">
                    <h3 className="font-orbitron font-semibold uppercase text-lg leading-tight">
                      {truncate(item.product.name, 48)}
                    </h3>
                    <p className="font-orbitron text-2xl font-bold text-accent">
                      {formatPrice(item.product.price)}
                    </p>
                    <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground">
                      {item.product.stock > 0 ? `${item.product.stock} IN STOCK` : 'OUT OF STOCK'}
                    </p>
                  </CardContent>

                  <CardFooter className="grid grid-cols-2 gap-3">
                    <Link href={`/products/${item.product.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        VIEW
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive"
                      isLoading={removingProductId === item.productId}
                      onClick={() => {
                        void handleRemove(item.productId);
                      }}
                    >
                      REMOVE
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}

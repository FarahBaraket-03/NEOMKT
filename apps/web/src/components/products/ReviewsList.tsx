"use client";

import { useEffect, useMemo, useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import { formatDate } from '@/lib/format';
import type { ProductReview } from '@/gql/__generated__';
import ReviewSubscription from './ReviewSubscription';
import { Terminal } from 'lucide-react';

const REVIEWS_PAGE_SIZE = 5;

export default function ReviewsList({
  reviews,
  productId,
}: {
  reviews: ProductReview[];
  productId: string;
}) {
  const [items, setItems] = useState<ProductReview[]>(reviews);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);
  const subscriptionProductId = useMemo(() => productId, [productId]);

  useEffect(() => {
    setItems(reviews);
  }, [reviews, productId]);

  useEffect(() => {
    setVisibleCount(REVIEWS_PAGE_SIZE);
  }, [productId]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border/50 bg-black/20 cyber-chamfer-sm">
        <Terminal className="w-8 h-8 text-mutedForeground mb-4 opacity-50" />
        <p className="text-mutedForeground font-mono uppercase tracking-widest text-sm">No feedback logs found in the archives.</p>
        <ReviewSubscription
          productId={subscriptionProductId}
          onNewReview={(review) => {
            setItems([review as ProductReview]);
          }}
        />
      </div>
    );
  }

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <div className="space-y-4">
      <ReviewSubscription
        productId={subscriptionProductId}
        onNewReview={(review) => {
          setItems((prev) => {
            const withoutCurrent = prev.filter((item) => item.id !== review.id);
            return [review as ProductReview, ...withoutCurrent];
          });
        }}
      />
      {visibleItems.map((review) => (
        <Card key={review.id} variant="terminal" className="border-accent/20 bg-black/40 backdrop-blur">
          <CardContent className="pt-5 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-3">
              <div className="flex items-center gap-3">
                <p className="font-mono font-bold text-accent uppercase tracking-widest">
                  &gt; {review.user.username}
                </p>
                {review.isVerified && (
                  <span className="text-[10px] font-mono bg-accentTertiary/20 text-accentTertiary px-2 py-0.5 border border-accentTertiary/30 cyber-chamfer-sm uppercase tracking-wider">
                    VERIFIED_OP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <StarRating value={review.rating} readOnly className="scale-90 origin-right" />
                <span className="text-xs text-mutedForeground font-mono opacity-70">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="pt-2">
              {review.title && (
                <h4 className="font-orbitron tracking-widest uppercase text-white mb-2 text-sm">
                  {review.title}
                </h4>
              )}
              <p className="text-sm text-mutedForeground font-mono leading-relaxed">
                {review.comment}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMore ? (
        <div className="pt-2 flex items-center justify-between gap-4">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-mutedForeground">
            SHOWING {visibleItems.length} / {items.length}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((count) => count + REVIEWS_PAGE_SIZE)}
          >
            LOAD_MORE
          </Button>
        </div>
      ) : null}
    </div>
  );
}

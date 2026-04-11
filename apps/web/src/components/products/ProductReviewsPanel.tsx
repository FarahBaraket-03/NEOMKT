'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';
import type { ProductReview } from '@/gql/__generated__';
import { GET_REVIEWS } from '@/gql/documents';
import Card, { CardContent } from '@/components/ui/Card';
import CreateReviewForm from '@/components/reviews/CreateReviewForm';
import ReviewsList from './ReviewsList';

function mergeReviews(primary: ProductReview[], secondary: ProductReview[]): ProductReview[] {
  const byId = new Map<string, ProductReview>();

  for (const review of [...primary, ...secondary]) {
    byId.set(review.id, review);
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export default function ProductReviewsPanel({
  reviews,
  productId,
}: {
  reviews: ProductReview[];
  productId: string;
}) {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [liveReviews, setLiveReviews] = useState<ProductReview[]>(reviews);
  const { data } = useQuery(GET_REVIEWS, {
    variables: { productId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  useEffect(() => {
    setLiveReviews(reviews);
  }, [reviews, productId]);

  useEffect(() => {
    const freshReviews = data?.reviews as ProductReview[] | undefined;
    if (freshReviews) {
      setLiveReviews((previous) => mergeReviews(freshReviews, previous));
    }
  }, [data]);

  return (
    <div className="space-y-8">
      {user ? (
        <CreateReviewForm
          productId={productId}
          onCreated={(review) => {
            setLiveReviews((previous) => mergeReviews([review], previous));
            pushToast({
              title: 'REVIEW SUBMITTED',
              description: 'Your review is now visible.',
              variant: 'success',
            });
          }}
        />
      ) : (
        <Card variant="terminal">
          <CardContent className="pt-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-accent" />
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-mutedForeground">
                Log in to add comments and ratings.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="font-mono text-xs uppercase tracking-[0.16em] text-accent hover:text-accentSecondary transition-colors"
            >
              GO_TO_LOGIN
            </Link>
          </CardContent>
        </Card>
      )}

      <ReviewsList reviews={liveReviews} productId={productId} />
    </div>
  );
}

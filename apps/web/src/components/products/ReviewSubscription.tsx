'use client';

import { useEffect, useRef } from 'react';
import { useSubscription } from '@apollo/client';
import { REVIEW_ADDED_SUBSCRIPTION } from '@/gql/documents';
import { useToast } from '@/components/ui/Toast';

export default function ReviewSubscription({
  productId,
  onNewReview,
}: {
  productId: string;
  onNewReview?: (review: { id: string }) => void;
}) {
  const { pushToast } = useToast();
  const onNewReviewRef = useRef(onNewReview);
  const lastReviewIdRef = useRef<string | null>(null);
  const { data } = useSubscription(REVIEW_ADDED_SUBSCRIPTION, {
    variables: { productId },
  });

  useEffect(() => {
    onNewReviewRef.current = onNewReview;
  }, [onNewReview]);

  useEffect(() => {
    // Reset de-duplication when switching to another product stream.
    lastReviewIdRef.current = null;
  }, [productId]);

  useEffect(() => {
    const review = data?.reviewAdded;
    if (!review) {
      return;
    }

    if (lastReviewIdRef.current === review.id) {
      return;
    }

    lastReviewIdRef.current = review.id;

    onNewReviewRef.current?.(review);
    pushToast({
      title: 'NEW REVIEW RECEIVED',
      description: `${review.user.username} left a rating of ${review.rating}`,
      variant: 'success',
    });
  }, [data, pushToast]);

  return null;
}

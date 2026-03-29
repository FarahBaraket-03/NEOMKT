'use client';

import { useEffect } from 'react';
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
  const { data } = useSubscription(REVIEW_ADDED_SUBSCRIPTION, {
    variables: { productId },
  });

  useEffect(() => {
    const review = data?.reviewAdded;
    if (!review) {
      return;
    }

    onNewReview?.(review);
    pushToast({
      title: 'NEW REVIEW RECEIVED',
      description: `${review.user.username} left a rating of ${review.rating}`,
      variant: 'success',
    });
  }, [data, onNewReview, pushToast]);

  return null;
}

'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import { DELETE_REVIEW, UPDATE_REVIEW } from '@/gql/documents';

export default function EditReviewForm({
  review,
  isOwner,
  onUpdated,
}: {
  review: { id: string; rating: number; title?: string | null; comment: string };
  isOwner: boolean;
  onUpdated?: () => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title ?? '');
  const [comment, setComment] = useState(review.comment);

  const [updateReview, { loading: updating }] = useMutation(UPDATE_REVIEW);
  const [deleteReview, { loading: deleting }] = useMutation(DELETE_REVIEW);

  if (!isOwner) {
    return null;
  }

  return (
    <Card variant="terminal">
      <CardHeader>
        <h3 className="font-orbitron uppercase text-2xl">&gt;_ EDIT REVIEW</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StarRating value={rating} readOnly={false} onChange={setRating} />
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="TITLE" />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="cyber-chamfer-sm w-full h-36 border border-border bg-input p-3 font-jetbrains text-sm"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              isLoading={updating}
              onClick={async () => {
                await updateReview({
                  variables: {
                    id: review.id,
                    input: {
                      rating,
                      title,
                      comment,
                    },
                  },
                });
                onUpdated?.();
              }}
            >
              UPDATE REVIEW
            </Button>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant="destructive">DELETE</Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-background/80" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cyber-chamfer border border-destructive bg-card p-6 max-w-md w-[90vw]">
                  <Dialog.Title className="font-orbitron uppercase text-destructive">CONFIRM DELETE</Dialog.Title>
                  <p className="font-jetbrains text-sm mt-3">This action cannot be undone.</p>
                  <div className="mt-6 flex gap-3">
                    <Dialog.Close asChild>
                      <Button variant="ghost">CANCEL</Button>
                    </Dialog.Close>
                    <Button
                      variant="destructive"
                      isLoading={deleting}
                      onClick={async () => {
                        await deleteReview({ variables: { id: review.id } });
                        onUpdated?.();
                      }}
                    >
                      CONFIRM
                    </Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

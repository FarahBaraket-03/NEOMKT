'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import { CREATE_REVIEW } from '@/gql/documents';
import type { ProductReview } from '@/gql/__generated__';

export default function CreateReviewForm({
  productId,
  onCreated,
}: {
  productId: string;
  onCreated?: (review: ProductReview) => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [createReview, { loading }] = useMutation(CREATE_REVIEW);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (comment.trim().length === 0) {
      setError('Comment is required');
      return;
    }

    if (comment.length > 2000) {
      setError('Comment must be 2000 characters or less');
      return;
    }

    try {
      const result = await createReview({
        variables: {
          input: {
            productId,
            rating,
            title: title || null,
            comment,
          },
        },
      });

      const createdReview = result.data?.createReview as ProductReview | undefined;
      setTitle('');
      setComment('');
      setRating(5);
      if (createdReview) {
        onCreated?.(createdReview);
      }
    } catch (mutationError) {
      setError((mutationError as Error).message);
    }
  };

  return (
    <Card variant="terminal">
      <CardHeader>
        <h3 className="font-orbitron uppercase text-2xl">&gt;_ CREATE REVIEW</h3>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <StarRating value={rating} readOnly={false} onChange={setRating} />
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="TITLE" />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="> COMMENT"
            className="cyber-chamfer-sm w-full h-36 border border-border bg-input p-3 font-jetbrains text-sm outline-none focus:border-accent focus:shadow-neon-sm"
          />
          {error ? <p className="text-destructive font-jetbrains text-sm">! ERROR: {error}</p> : null}
          <Button type="submit" variant="glitch" isLoading={loading}>
            SUBMIT REVIEW
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

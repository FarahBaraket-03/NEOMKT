'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { GET_ADMIN_REVIEWS } from '@/gql/documents';
import { useAuth } from '@/lib/auth/AuthContext';

interface AdminReview {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerified: boolean;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    username: string;
  } | null;
}

interface AdminReviewsQueryData {
  reviews: AdminReview[];
  reviewsCount: number;
}

const PAGE_SIZE = 20;

export default function AdminReviewsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { session, user, isLoading: isAuthLoading } = useAuth();
  const skipQuery = isAuthLoading || !session || !user;

  const { data, loading, error } = useQuery<AdminReviewsQueryData>(GET_ADMIN_REVIEWS, {
    variables: {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    },
    fetchPolicy: 'cache-and-network',
    skip: skipQuery,
  });

  useEffect(() => {
    if (!error) {
      return;
    }

    const forbidden = error.graphQLErrors.some(
      (graphQLError) =>
        graphQLError.extensions?.code === 'FORBIDDEN'
        || graphQLError.message === 'Admin role required',
    );

    if (forbidden || error.message.includes('Admin role required')) {
      router.replace('/');
    }
  }, [error, router]);

  const reviews = data?.reviews ?? [];
  const totalReviews = data?.reviewsCount ?? 0;

  const pagination = useMemo(() => {
    const totalPages = Math.max(Math.ceil(totalReviews / PAGE_SIZE), 1);
    return {
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    };
  }, [page, totalReviews]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">REVIEWS</h1>
        <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
          {'> moderation stream // customer sentiment'}
        </p>
      </div>

      <Card variant="terminal" className="overflow-hidden">
        <CardContent className="pt-10 space-y-4">
          <div className="overflow-x-auto border border-border cyber-chamfer-sm">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Rating</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Title</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Product</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">User</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Verified</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Created At</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, index) => (
                  <tr
                    key={review.id}
                    className={[
                      'border-b border-border/50 font-jetbrains text-sm',
                      index % 2 === 0 ? 'bg-muted/20' : '',
                      'hover:bg-muted/40 transition-colors',
                    ].join(' ')}
                  >
                    <td className="px-3 py-2 text-accent">{'★'.repeat(review.rating)}</td>
                    <td className="px-3 py-2 uppercase tracking-wide">{review.title ?? '-'}</td>
                    <td className="px-3 py-2 uppercase tracking-wide">
                      <Link href={`/products/${review.product.slug}`} className="text-accent hover:underline">
                        {review.product.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 uppercase tracking-wide">{review.user?.username ?? 'ANONYMOUS'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={[
                          'inline-flex items-center h-6 px-2 text-[10px] font-sharetech uppercase tracking-widest cyber-chamfer-sm border',
                          review.isVerified
                            ? 'border-accent/60 text-accent bg-accent/10'
                            : 'border-border text-mutedForeground bg-muted/30',
                        ].join(' ')}
                      >
                        {review.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-mutedForeground">{new Date(review.createdAt).toLocaleString()}</td>
                  </tr>
                ))}

                {!loading && !isAuthLoading && reviews.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center font-sharetech text-xs uppercase tracking-widest text-mutedForeground"
                    >
                      {'> no reviews found'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">
              {`> records ${Math.min((page - 1) * PAGE_SIZE + 1, totalReviews)}-${Math.min(page * PAGE_SIZE, totalReviews)} / ${totalReviews}`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrev}
              >
                PREV
              </Button>
              <span className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">
                {`Page ${page} / ${pagination.totalPages}`}
              </span>
              <Button
                variant="ghost"
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNext}
              >
                NEXT
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/gql/documents';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import type { Product } from '@/gql/__generated__';

const COLD_START_THRESHOLD_MS = 3000;

interface ProductsGridProps {
  filters: {
    brandId?: string;
    categoryId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  };
}

export default function ProductsGrid({ filters }: ProductsGridProps) {
  const variables = useMemo(() => filters, [filters]);
  const { data, loading } = useQuery(GET_PRODUCTS, { variables });
  const [showColdStartMsg, setShowColdStartMsg] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowColdStartMsg(false);
      return;
    }

    const timer = setTimeout(() => setShowColdStartMsg(true), COLD_START_THRESHOLD_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}

        {showColdStartMsg && (
          <div className="col-span-full text-center py-8 font-jetbrains text-mutedForeground text-sm space-y-2">
            <p className="text-accent animate-pulse">{'> WAKING SERVER...'}</p>
            <p>{'> FREE tier cold start - please wait ~60 seconds'}</p>
            <p>{'> This only happens after 15 min of inactivity'}</p>
          </div>
        )}
      </div>
    );
  }

  const products = (data?.products ?? []) as Product[];

  if (products.length === 0) {
    return (
      <div className="cyber-chamfer border border-border bg-card p-8 font-jetbrains text-mutedForeground">
        &gt; NO SIGNAL // NO PRODUCTS MATCH CURRENT FILTERS
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

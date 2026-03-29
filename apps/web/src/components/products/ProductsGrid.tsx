'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/gql/documents';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import type { Product } from '@/gql/__generated__';

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

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
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

'use client';

import { useQuery } from '@apollo/client';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { GET_FEATURED_PRODUCTS } from '@/gql/documents';
import type { Product } from '@/gql/__generated__';

export default function FeaturedProducts() {
  const { data, loading } = useQuery(GET_FEATURED_PRODUCTS);

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {loading
        ? Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />)
        : ((data?.products ?? []) as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
    </div>
  );
}

'use client';

import { useQuery } from '@apollo/client';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import BrandCard from '@/components/brands/BrandCard';
import Card, { CardContent } from '@/components/ui/Card';
import { GET_BRANDS } from '@/gql/documents';
import type { Brand } from '@/gql/__generated__';

export default function BrandsPage() {
  const { data } = useQuery(GET_BRANDS);
  const brands = (data?.brands ?? []) as Brand[];

  return (
    <PageContainer>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="border-b border-border pb-6">
          <h1 
            className="text-5xl md:text-7xl font-black uppercase tracking-widest text-shadow-neon font-orbitron text-accent" 
          >
            MEGACORPS_
          </h1>
          <p className="text-mutedForeground font-mono mt-2 uppercase tracking-widest">
            // AUTHORIZED MANUFACTURERS & SUPPLIERS
            <span className="ml-2 inline-block animate-blink text-accent">_</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

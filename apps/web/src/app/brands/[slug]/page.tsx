'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { ArrowLeft, Building2, Globe, ShieldCheck } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import ProductsGrid from '@/components/products/ProductsGrid';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { GET_BRANDS } from '@/gql/documents';
import type { Brand } from '@/gql/__generated__';

export default function BrandProductsPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const { data, loading } = useQuery(GET_BRANDS);
  const brands = (data?.brands ?? []) as Brand[];

  const brand = useMemo(
    () => brands.find((item) => item.slug === slug) ?? null,
    [brands, slug],
  );

  return (
    <PageContainer>
      <Section variant="grid" className="pb-10" title="BRAND NODE" subtitle="PRODUCTS ROUTED BY MANUFACTURER">
        <div className="space-y-6">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-accent font-sharetech text-xs uppercase tracking-[0.2em] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back To Brands
          </Link>

          {loading ? (
            <Card variant="terminal">
              <CardContent className="pt-8 font-sharetech text-xs uppercase tracking-[0.2em] text-accent">
                {'>'} Establishing brand uplink...
                <span className="ml-2 animate-blink">|</span>
              </CardContent>
            </Card>
          ) : null}

          {!loading && !brand ? (
            <Card variant="terminal">
              <CardHeader>
                <h2 className="font-orbitron text-3xl uppercase text-destructive">404 // Brand Not Found</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-jetbrains text-mutedForeground uppercase tracking-[0.12em] text-sm">
                  Requested manufacturer node does not exist in the active catalog.
                </p>
                <Link href="/brands">
                  <Button variant="outline">Return To Brand Directory</Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {brand ? (
            <>
              <Card variant="holographic">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="tertiary">Megacorp</Badge>
                    <Badge>{brand.products?.length ?? 0} Products</Badge>
                    {brand.country ? <Badge variant="secondary">{brand.country}</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                      <h1
                        data-text={brand.name}
                        className="cyber-glitch font-orbitron font-black uppercase text-4xl md:text-6xl text-accent"
                        style={{ textShadow: '-2px 0 #ff00ff, 2px 0 #00d4ff' }}
                      >
                        {brand.name}
                      </h1>
                      <p className="mt-4 max-w-3xl text-foreground/90 font-jetbrains leading-relaxed">
                        High-signal manufacturer node with active products in the catalog feed.
                      </p>
                    </div>
                    <div className="space-y-2 font-sharetech text-xs uppercase tracking-[0.16em] text-mutedForeground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-accent" />
                        Founded: {brand.foundedYear ?? 'Unknown'}
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-accentSecondary" />
                        Status: Verified Node
                      </div>
                      {brand.logoUrl ? (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-accentTertiary" />
                          Logo source online
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="terminal">
                <CardHeader>
                  <h2 className="font-orbitron uppercase text-2xl text-foreground">
                    {'>'}_ Product Feed // {brand.name}
                  </h2>
                </CardHeader>
                <CardContent>
                  <ProductsGrid
                    filters={{
                      brandId: brand.id,
                      sortBy: 'created_at',
                      sortOrder: 'DESC',
                      limit: 60,
                    }}
                  />
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </Section>
    </PageContainer>
  );
}

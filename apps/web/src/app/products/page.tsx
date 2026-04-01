'use client';

import { useMemo } from 'react';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Cpu, HardDrive, Headphones, Keyboard, Laptop, Mouse } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import FilterSidebar from '@/components/products/FilterSidebar';
import ProductsGrid from '@/components/products/ProductsGrid';
import Pagination from '@/components/ui/Pagination';
import Card, { CardContent } from '@/components/ui/Card';
import { GET_BRANDS, GET_CATEGORIES } from '@/gql/documents';

const PAGE_SIZE = 12;

const QUICK_CATEGORY_SLOTS = [
  { slug: 'laptops', label: 'LAPTOPS', icon: Laptop },
  { slug: 'keyboards', label: 'KEYBOARDS', icon: Keyboard },
  { slug: 'mice', label: 'MOUSE', icon: Mouse },
  { slug: 'headsets', label: 'HEADPHONES', icon: Headphones },
  { slug: 'ssds', label: 'DISKS', icon: HardDrive },
  { slug: 'external-drives', label: 'PORTABLE DISKS', icon: Cpu },
] as const;

export default function ProductsPage() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const offset = Math.max(page - 1, 0) * PAGE_SIZE;

  const value = useMemo(
    () => ({
      search: searchParams.get('search') ?? undefined,
      brandId: searchParams.get('brandId') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      minPrice: searchParams.get('minPrice') ?? undefined,
      maxPrice: searchParams.get('maxPrice') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? 'created_at',
      sortOrder: searchParams.get('sortOrder') ?? 'DESC',
    }),
    [searchParams],
  );

  const filters = {
    ...value,
    minPrice: value.minPrice ? Number(value.minPrice) : undefined,
    maxPrice: value.maxPrice ? Number(value.maxPrice) : undefined,
    sortOrder: value.sortOrder as 'ASC' | 'DESC',
    limit: PAGE_SIZE,
    offset,
  };

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: brandsData } = useQuery(GET_BRANDS);

  const quickCategories = useMemo(() => {
    const categories = (categoriesData?.categories ?? []) as Array<{
      id: string;
      slug: string;
      name: string;
    }>;
    const bySlug = new Map<string, { id: string; slug: string; name: string }>(
      categories.map((item) => [item.slug, item]),
    );

    return QUICK_CATEGORY_SLOTS.map((slot) => {
      const category = bySlug.get(slot.slug);
      return {
        ...slot,
        id: category?.id,
        name: category?.name ?? slot.label,
      };
    }).filter((item) => Boolean(item.id));
  }, [categoriesData]);

  return (
    <PageContainer>
      <div className="space-y-8 animate-in fade-in duration-500 py-8">
        <div className="border-b border-border pb-6">
          <h1 
            className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-[0.1em] sm:tracking-widest text-shadow-neon font-orbitron text-accent break-words" 
          >
            CATALOG_FEED
          </h1>
          <p className="text-mutedForeground font-mono mt-2 uppercase tracking-widest">
            // HARDWARE_INVENTORY_SCAN
            <span className="ml-2 inline-block animate-blink text-accent">_</span>
          </p>
        </div>

        <Card variant="terminal" className="mb-8 p-6">
          <div className="pt-2 space-y-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-mono text-sm md:text-base text-mutedForeground max-w-3xl leading-relaxed">
                  High signal categories: disks, keyboards, laptops, mouse, headphones and more. Tap a node to instantly pivot the feed.
                </p>
              </div>
              <p className="font-sharetech text-xs uppercase tracking-[0.2em] text-accentTertiary">
                Live Query Mode <span className="animate-blink">|</span>
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {quickCategories.map((category) => {
                const Icon = category.icon;
                const isActive = value.categoryId === category.id;
                return (
                  <button
                    key={category.slug}
                    type="button"
                    className={`cyber-chamfer-sm border px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'border-accent text-accent shadow-[0_0_8px_#00ff8860]'
                        : 'border-border text-foreground hover:border-accent hover:text-accent'
                    }`}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (isActive) {
                        params.delete('categoryId');
                      } else {
                        params.set('categoryId', category.id as string);
                      }
                      params.set('page', '1');
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="font-sharetech text-xs uppercase tracking-[0.18em]">{category.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <div className="lg:hidden">
            <button
              type="button"
              className="cyber-chamfer-sm border-2 border-accent bg-transparent px-4 py-3 w-full text-center font-mono text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-background hover:shadow-[var(--box-shadow-neon)] transition-all duration-150"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              OPEN_FILTERS &gt;
            </button>
          </div>
          <FilterSidebar
            categories={(categoriesData?.categories ?? []).map((item: { id: string; name: string }) => ({ id: item.id, name: item.name }))}
            brands={(brandsData?.brands ?? []).map((item: { id: string; name: string }) => ({ id: item.id, name: item.name }))}
            value={value}
            isMobileOpen={isMobileFiltersOpen}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
            onApply={(next) => {
              const params = new URLSearchParams(searchParams.toString());
              Object.entries(next).forEach(([key, rawValue]) => {
                const normalized = rawValue?.trim();
                if (!normalized) {
                  params.delete(key);
                } else {
                  params.set(key, normalized);
                }
              });
              params.set('page', '1');
              router.push(`${pathname}?${params.toString()}`);
              setIsMobileFiltersOpen(false);
            }}
          />
          <div className="space-y-6">
            <ProductsGrid filters={filters} />
            <Pagination page={page} totalPages={20} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

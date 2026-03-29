'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Cpu, Keyboard, Monitor, Smartphone, Tablet, Headphones } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import { GET_CATEGORIES } from '@/gql/documents';
import type { Category } from '@/gql/__generated__';

const iconMap: Record<string, JSX.Element> = {
  electronics: <Cpu className="h-6 w-6" />,
  laptops: <Monitor className="h-6 w-6" />,
  smartphones: <Smartphone className="h-6 w-6" />,
  tablets: <Tablet className="h-6 w-6" />,
  peripherals: <Keyboard className="h-6 w-6" />,
  headsets: <Headphones className="h-6 w-6" />,
};

export default function CategoriesGrid() {
  const { data } = useQuery(GET_CATEGORIES);
  const categories = ((data?.categories ?? []) as Category[]).filter((category) =>
    ['electronics', 'laptops', 'smartphones', 'tablets', 'peripherals'].includes(category.slug),
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/products?categoryId=${category.id}`}>
          <Card variant="holographic" className="group hover:-translate-y-1 hover:border-accent hover:shadow-[var(--box-shadow-neon-sm)] transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto text-accent w-fit group-hover:scale-110 transition-transform">{iconMap[category.slug] ?? <Cpu className="h-6 w-6" />}</div>
              <h4 className="mt-3 font-orbitron uppercase text-sm group-hover:text-accent transition-colors">{category.name}</h4>
              <p className="mt-1 text-xs font-sharetech text-mutedForeground uppercase tracking-[0.2em]">
                {category.products?.length ?? 0} ITEMS
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

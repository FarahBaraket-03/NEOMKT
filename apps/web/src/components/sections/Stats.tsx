'use client';

import { useQuery } from '@apollo/client';
import Card, { CardContent } from '@/components/ui/Card';
import { GET_HOME_STATS } from '@/gql/documents';

export default function Stats() {
  const { data } = useQuery(GET_HOME_STATS);
  const totalProducts = data?.productsCount ?? 0;
  const brands = data?.brands ?? [];
  const categories = data?.categories ?? [];

  const stats = [
    { label: 'TOTAL_PRODUCTS', value: totalProducts.toLocaleString('en-US'), accent: true },
    { label: 'VERIFIED_BRANDS', value: brands.length.toLocaleString('en-US'), accent: true },
    { label: 'DATA_CATEGORIES', value: categories.length.toLocaleString('en-US'), accent: true },
    { label: 'CATALOG_STATUS', value: 'LIVE', accent: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
      {/* Decorative center connecting line for larger screens */}
      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-border -z-10 w-full" />
      
      {stats.map((stat, i) => (
        <Card key={stat.label} variant="terminal" className="border-accent/30 group hover:border-accent hover:shadow-[var(--box-shadow-neon-sm)] transition-all duration-300 transform md:-skew-y-2 bg-black/60">
          <CardContent className="pt-6 relative">
            <span className="absolute top-2 right-3 text-[10px] font-mono text-mutedForeground">
              0{i + 1}
            </span>
            <p className={`font-orbitron font-bold text-4xl lg:text-5xl ${stat.accent ? 'text-accent drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]' : 'text-foreground'}`}>
              {stat.value}
              {stat.accent ? <span className="text-accent/50 text-2xl animate-pulse">+</span> : null}
            </p>
            <p className="mt-3 font-mono text-[10px] md:text-xs uppercase tracking-widest text-mutedForeground group-hover:text-foreground transition-colors">
              {stat.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

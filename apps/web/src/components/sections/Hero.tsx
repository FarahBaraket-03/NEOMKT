"use client";

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { GET_HOME_STATS } from '@/gql/documents';

export default function Hero() {
  const { data } = useQuery(GET_HOME_STATS);
  const totalProducts = data?.productsCount ?? 0;
  const brands = (data?.brands ?? []) as Array<{ id: string }>;
  const categories = (data?.categories ?? []) as Array<{ id: string }>;

  return (
    <section className="py-24 lg:py-32 relative">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
        <div className="space-y-8 z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-accent/50 bg-accent/10 cyber-chamfer-sm">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">CATALOG_LIVE</span>
            </div>
            <h1
              className="font-orbitron font-black uppercase text-6xl md:text-8xl lg:text-9xl text-white tracking-wider mb-4"
            >
              NEO<span className="text-white cyber-glitch" data-text="MKT">MKT</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-white font-orbitron uppercase tracking-widest mb-8">
              PREMIUM <span className="text-accent">TECHNOLOGY</span> CATALOG
            </h2>
            <div className="font-mono text-sm text-mutedForeground space-y-2 mb-8">
              <p>&gt; INITIALIZING PRODUCT DATABASES...</p>
              <p className="animate-pulse">&gt; AGGREGATING LATEST HARDWARE SPECS...</p>
              <p className="text-accent">&gt; CATALOG SYNCED. READY TO BROWSE.<span className="animate-blink">_</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/products">
              <Button variant="default" size="lg" className="font-bold tracking-widest">START_SCAN &gt;</Button>
            </Link>
          </div>
        </div>

        <div className="hidden lg:block relative z-10">
          {/* Decorative background circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 border border-accent/20 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 border border-accentTertiary/20 rounded-full" />
          
          <Card variant="terminal" className="backdrop-blur-md bg-black/60 border-accent shadow-[var(--box-shadow-neon-sm)] relative">
            {/* Top-right decorative elements */}
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-1 h-1 bg-accent" />
              <div className="w-1 h-1 bg-accent" />
              <div className="w-1 h-1 bg-accent/50" />
            </div>

            <CardHeader className="border-b border-accent/30 pb-4">
              <h3 className="font-mono text-sm uppercase text-accent tracking-widest flex justify-between items-center">
                <span>NEOMKT.STATS</span>
                <span className="opacity-70">&gt;_</span>
              </h3>
            </CardHeader>
            <CardContent className="font-mono text-xs uppercase tracking-widest space-y-6 pt-6 pb-2">
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-mutedForeground">TOTAL_PRODUCTS:</span>
                <span className="text-white">{totalProducts.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-mutedForeground">VERIFIED_BRANDS:</span>
                <span className="text-accent">{brands.length.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-mutedForeground">DATA_CATEGORIES:</span>
                <span className="text-foreground">{categories.length.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-mutedForeground">PRICE_UPDATES:</span>
                <span className="text-foreground">REAL-TIME</span>
              </div>
              
              <div className="pt-4 border-t border-accent/30">
                <div className="h-2 w-full bg-border relative overflow-hidden mb-2">
                  <div className="absolute top-0 left-0 h-full w-[87%] bg-accent flex items-center justify-end px-1">
                    <div className="w-1 h-full bg-black/50" />
                  </div>
                  <div className="absolute top-0 left-0 w-2 h-full bg-black/30 animate-pulse" />
                </div>
                <div className="flex justify-end">
                  <span className="text-[9px] text-accent">INDEX_LOAD: 87%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from 'next/link';
import { Activity, Cpu, Package, PackageX, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';
import SpecsTable from './SpecsTable';
import WishlistButton from './WishlistButton';
import { useLiveProduct } from '@/components/realtime/LiveCatalogContext';
import type { Product } from '@/gql/__generated__';

export default function ProductInfo({ product }: { product: Product }) {
  const { product: liveProduct, event, isHot } = useLiveProduct(product);

  const isPriceUpdate = event?.kind === 'PRICE_UPDATE';
  const isStockUpdate = event?.kind === 'STOCK_UPDATE';
  const priceIncreased = isPriceUpdate ? event.newValue > event.oldValue : false;

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <Link href={`/products?brandId=${liveProduct.brand.id}`} className="text-accentTertiary font-mono uppercase tracking-widest hover:underline text-sm mb-2 block font-bold transition-all hover:text-shadow-neon">
          // {liveProduct.brand.name}
        </Link>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-wider font-orbitron text-white mt-1 mb-4 leading-none">
          {liveProduct.name}
        </h1>
      </div>

      <div className="text-4xl lg:text-5xl font-mono text-foreground flex items-center gap-3">
        <span className="text-accent">$</span>
        <span
          className={
            isHot && isPriceUpdate
              ? priceIncreased
                ? 'text-destructive animate-pulse'
                : 'text-accent animate-pulse'
              : ''
          }
        >
          {liveProduct.price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>

        {isHot && event ? (
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em]">
            <Activity className="h-4 w-4 text-accent animate-pulse" />
            {isPriceUpdate ? (
              <>
                {priceIncreased ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-accent" />
                )}
                <span className={priceIncreased ? 'text-destructive' : 'text-accent'}>
                  LIVE PRICE
                </span>
              </>
            ) : null}
            {isStockUpdate ? (
              <>
                {liveProduct.stock > 0 ? (
                  <Package className="h-4 w-4 text-accent" />
                ) : (
                  <PackageX className="h-4 w-4 text-destructive" />
                )}
                <span className={liveProduct.stock > 0 ? 'text-accent' : 'text-destructive'}>
                  LIVE STOCK
                </span>
              </>
            ) : null}
          </span>
        ) : null}
      </div>

      <Card variant="terminal" className="p-5 border-accent/30 bg-black/40 backdrop-blur">
        <p className="font-mono text-sm md:text-base text-mutedForeground leading-relaxed">
          {liveProduct.description || "Military-grade hardware. Built for extreme environments and high-level structural integrity."}
        </p>
      </Card>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2">
        <div className={`px-3 py-1 flex items-center gap-2 cyber-chamfer-sm border ${liveProduct.stock > 0 ? 'bg-accent/10 border-accent/50 text-accent' : 'bg-destructive/10 border-destructive/50 text-destructive'}`}>
          <span className={`h-2 w-2 rounded-full ${liveProduct.stock > 0 ? 'animate-pulse bg-accent' : 'bg-destructive'}`} />
          {liveProduct.stock > 0 ? 'IN_STOCK' : 'DEPLETED'}
        </div>
        <div className="text-mutedForeground opacity-70">
          [{liveProduct.stock} UNITS AVAILABLE]
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StarRating value={liveProduct.avgRating} readOnly />
          <span className="text-mutedForeground hover:text-accent transition-colorscursor-pointer">
            <a href="#reviews">({liveProduct.reviewCount} REVIEWS)</a>
          </span>
        </div>
      </div>

      {liveProduct.specs && liveProduct.specs.length > 0 && (
        <div className="mt-4 md:mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-accent" />
            <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest font-orbitron text-white">
              TECHNICAL_SPECS
            </h3>
          </div>
          <SpecsTable specs={liveProduct.specs} />
        </div>
      )}

      <div className="pt-6 mt-auto">
        <WishlistButton productId={liveProduct.id} />
      </div>
      
      <div className="flex items-center gap-3 text-xs font-mono text-mutedForeground mt-4 p-3 bg-white/5 cyber-chamfer-sm">
        <ShieldAlert className="w-5 h-5 text-accentSecondary" />
        <span>WARRANTY VOID IF NEURAL LINK IS TAMPERED WITH.</span>
      </div>
    </div>
  );
}

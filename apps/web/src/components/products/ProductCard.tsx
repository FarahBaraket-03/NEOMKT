"use client";

import Link from 'next/link';
import { Activity, Package, PackageX, TrendingDown, TrendingUp } from 'lucide-react';
import type { Product } from '@/gql/__generated__';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import { useLiveProduct } from '@/components/realtime/LiveCatalogContext';
import { formatPrice, truncate } from '@/lib/format';
import { resolveImageUrl } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const { product: liveProduct, event, isHot } = useLiveProduct(product);

  const isPriceUpdate = event?.kind === 'PRICE_UPDATE';
  const isStockUpdate = event?.kind === 'STOCK_UPDATE';
  const priceIncreased = isPriceUpdate ? event.newValue > event.oldValue : false;
  const stockPositive = liveProduct.stock > 0;

  return (
    <Card
      variant="holographic"
      className={`group relative overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-accent hover:shadow-[var(--box-shadow-neon)] ${
        isHot
          ? 'border-accent shadow-[var(--box-shadow-neon-lg)] ring-1 ring-accent/70'
          : ''
      }`}
    >
      <Badge className="absolute top-3 right-3 z-20" variant={liveProduct.status === 'ACTIVE' ? 'default' : 'secondary'}>
        {liveProduct.status}
      </Badge>
      
      <div className="relative h-48 w-full border-b border-border bg-black/40 overflow-hidden">
        <SmartImage
          src={resolveImageUrl(liveProduct.imageUrl)}
          alt={liveProduct.name}
          fill
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 will-change-transform filter contrast-125 saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      <CardContent className="flex flex-col flex-1 pt-5 space-y-3">
        <p className="font-sharetech text-xs text-accentTertiary uppercase tracking-[0.2em] relative z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accentTertiary animate-pulse" />
          {liveProduct.brand.name}
        </p>

        {isHot && event ? (
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] flex items-center gap-2">
            <Activity className="h-3 w-3 text-accent animate-pulse" />
            {isPriceUpdate ? (
              <>
                {priceIncreased ? (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-accent" />
                )}
                <span className={priceIncreased ? 'text-destructive' : 'text-accent'}>
                  PRICE {priceIncreased ? 'UPLINK' : 'DROP'}
                </span>
              </>
            ) : null}

            {isStockUpdate ? (
              <>
                {stockPositive ? (
                  <Package className="h-3 w-3 text-accent" />
                ) : (
                  <PackageX className="h-3 w-3 text-destructive" />
                )}
                <span className={stockPositive ? 'text-accent' : 'text-destructive'}>
                  STOCK {stockPositive ? 'RESTOCKED' : 'DEPLETED'}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
        
        <h3 className="font-orbitron font-semibold uppercase text-lg group-hover:text-accent transition-colors leading-tight line-clamp-2">
          {truncate(liveProduct.name, 48)}
        </h3>
        
        <div className="flex-1" />
        
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] text-mutedForeground font-mono uppercase tracking-widest mb-1">MSRP_VAL</p>
            <p
              className={`font-orbitron text-2xl font-bold drop-shadow-[0_0_8px_rgba(0,255,136,0.3)] ${
                isHot && isPriceUpdate
                  ? priceIncreased
                    ? 'text-destructive animate-pulse'
                    : 'text-accent animate-pulse'
                  : 'text-accent'
              }`}
            >
              {formatPrice(liveProduct.price)}
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <StarRating value={liveProduct.avgRating} readOnly />
            <span className="text-[10px] text-mutedForeground font-mono mt-1 opacity-70">
              [{liveProduct.reviewCount} RECORDS]
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/products/${liveProduct.slug}`} className="block w-full">
          <Button variant="outline" size="sm" className="w-full group-hover:bg-accent/10 border-border group-hover:border-accent">
            ACCESS_DATA &gt;
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

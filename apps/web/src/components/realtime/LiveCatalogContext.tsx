'use client';

import Link from 'next/link';
import { useSubscription } from '@apollo/client';
import {
  Activity,
  Package,
  PackageX,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import * as React from 'react';
import type { Product } from '@/gql/__generated__';
import {
  PRICE_UPDATED_SUBSCRIPTION,
  PRODUCT_STOCK_CHANGED_SUBSCRIPTION,
  PRODUCT_UPDATED_SUBSCRIPTION,
} from '@/gql/documents';

type LiveUpdateKind = 'PRICE_UPDATE' | 'STOCK_UPDATE';

type ProductStatus = Product['status'];

export interface LiveProductSnapshot {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: ProductStatus;
  brand?: Product['brand'];
  category?: Product['category'];
}

export interface LiveUpdateEvent {
  id: string;
  kind: LiveUpdateKind;
  productId: string;
  productName: string;
  productSlug: string;
  oldValue: number;
  newValue: number;
  at: number;
}

interface PriceUpdatedPayload {
  priceUpdated?: {
    oldPrice: number;
    newPrice: number;
    product: LiveProductSnapshot;
  } | null;
}

interface ProductUpdatedPayload {
  productUpdated?: LiveProductSnapshot | null;
}

interface StockChangedPayload {
  productStockChanged?: LiveProductSnapshot | null;
}

interface LiveCatalogContextValue {
  productsById: Record<string, LiveProductSnapshot>;
  recentEventsByProductId: Record<string, LiveUpdateEvent>;
  hotProductIds: Record<string, number>;
  activeToast: LiveUpdateEvent | null;
  primeProduct: (product: Product) => void;
  dismissActiveToast: () => void;
}

const HIGHLIGHT_MS = 3600;

const LiveCatalogContext = React.createContext<LiveCatalogContextValue | undefined>(
  undefined,
);

function mergeSnapshot(
  base: LiveProductSnapshot | undefined,
  incoming: LiveProductSnapshot,
): LiveProductSnapshot {
  if (!base) {
    return incoming;
  }

  return {
    ...base,
    ...incoming,
    brand: incoming.brand ?? base.brand,
    category: incoming.category ?? base.category,
  };
}

function toSnapshot(product: LiveProductSnapshot | Product): LiveProductSnapshot {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    stock: product.stock,
    status: product.status,
    brand: product.brand,
    category: product.category,
  };
}

function GlobalLiveUpdateToast() {
  const { activeToast, dismissActiveToast } = useLiveCatalog();

  if (!activeToast) {
    return null;
  }

  const isPriceUpdate = activeToast.kind === 'PRICE_UPDATE';
  const priceIncreased = activeToast.newValue > activeToast.oldValue;
  const inStockNow = activeToast.newValue > 0;
  const productHref = `/products/${activeToast.productSlug}`;

  return (
    <div className="fixed bottom-6 right-6 z-[10010] max-w-sm w-[92vw] sm:w-[360px]">
      <div className="bg-card/90 backdrop-blur-md border border-accent shadow-[var(--box-shadow-neon-sm)] p-4 cyber-chamfer-sm relative group transition-all duration-300">
        <button
          type="button"
          onClick={dismissActiveToast}
          className="absolute top-2 right-2 text-mutedForeground hover:text-accent transition-colors"
          aria-label="Dismiss live update"
        >
          <X className="h-4 w-4" />
        </button>

        <Link
          href={productHref}
          onClick={dismissActiveToast}
          className="flex items-start gap-4 w-full hover:opacity-85 transition-opacity"
        >
          <div className="mt-1">
            {isPriceUpdate ? (
              priceIncreased ? (
                <TrendingUp className="h-5 w-5 text-destructive" />
              ) : (
                <TrendingDown className="h-5 w-5 text-accent" />
              )
            ) : inStockNow ? (
              <Package className="h-5 w-5 text-accent" />
            ) : (
              <PackageX className="h-5 w-5 text-destructive" />
            )}
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-3 w-3 text-accent animate-pulse" />
              <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
                LIVE_UPDATE
              </span>
            </div>

            <h4 className="font-orbitron text-sm uppercase truncate text-foreground">
              {activeToast.productName}
            </h4>

            <p className="text-xs font-mono text-mutedForeground mt-1">
              {isPriceUpdate ? (
                <>
                  PRICE ADJUSTED:{' '}
                  <span className="line-through opacity-50">
                    ${activeToast.oldValue.toFixed(2)}
                  </span>{' '}
                  <span
                    className={
                      priceIncreased ? 'text-destructive' : 'text-accent'
                    }
                  >
                    ${activeToast.newValue.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  INVENTORY STATUS:{' '}
                  <span className={inStockNow ? 'text-accent' : 'text-destructive'}>
                    {inStockNow ? 'RESTOCKED' : 'DEPLETED'}
                  </span>{' '}
                  <span className="opacity-70">({Math.max(0, Math.round(activeToast.newValue))} UNITS)</span>
                </>
              )}
            </p>

            <div className="text-[10px] font-mono text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              CLICK TO VIEW DETAILS &gt;&gt;
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function LiveCatalogProvider({ children }: { children: React.ReactNode }) {
  const [productsById, setProductsById] = React.useState<
    Record<string, LiveProductSnapshot>
  >({});
  const [recentEventsByProductId, setRecentEventsByProductId] = React.useState<
    Record<string, LiveUpdateEvent>
  >({});
  const [hotProductIds, setHotProductIds] = React.useState<Record<string, number>>({});
  const [activeToast, setActiveToast] = React.useState<LiveUpdateEvent | null>(null);

  const productsRef = React.useRef<Record<string, LiveProductSnapshot>>({});
  const timersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissActiveToast = React.useCallback(() => {
    setActiveToast(null);
  }, []);

  React.useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const markHot = React.useCallback((productId: string, at: number) => {
    setHotProductIds((prev) => ({ ...prev, [productId]: at }));

    const currentTimer = timersRef.current[productId];
    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    timersRef.current[productId] = setTimeout(() => {
      setHotProductIds((prev) => {
        if (prev[productId] !== at) {
          return prev;
        }

        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }, HIGHLIGHT_MS);
  }, []);

  const upsertSnapshot = React.useCallback((incomingRaw: LiveProductSnapshot | Product) => {
    const incoming = toSnapshot(incomingRaw);
    const previous = productsRef.current[incoming.id];
    const merged = mergeSnapshot(previous, incoming);

    const nextProducts = { ...productsRef.current, [incoming.id]: merged };
    productsRef.current = nextProducts;
    setProductsById(nextProducts);

    return { previous, merged };
  }, []);

  const pushLiveEvent = React.useCallback(
    (event: LiveUpdateEvent) => {
      setRecentEventsByProductId((prev) => ({ ...prev, [event.productId]: event }));
      setActiveToast(event);
      markHot(event.productId, event.at);
    },
    [markHot],
  );

  const primeProduct = React.useCallback((product: Product) => {
    if (productsRef.current[product.id]) {
      return;
    }

    const snapshot = toSnapshot(product);
    const nextProducts = { ...productsRef.current, [snapshot.id]: snapshot };
    productsRef.current = nextProducts;
    setProductsById(nextProducts);
  }, []);

  const { data: productUpdatedData } = useSubscription<ProductUpdatedPayload>(
    PRODUCT_UPDATED_SUBSCRIPTION,
  );

  const { data: stockChangedData } = useSubscription<StockChangedPayload>(
    PRODUCT_STOCK_CHANGED_SUBSCRIPTION,
  );

  const { data: priceUpdatedData } = useSubscription<PriceUpdatedPayload>(
    PRICE_UPDATED_SUBSCRIPTION,
  );

  React.useEffect(() => {
    const incoming = productUpdatedData?.productUpdated;
    if (!incoming) {
      return;
    }

    const { previous, merged } = upsertSnapshot(incoming);

    if (!previous || previous.status === merged.status) {
      return;
    }

    const toggledOutOfStockState =
      previous.status === 'OUT_OF_STOCK' || merged.status === 'OUT_OF_STOCK';

    if (!toggledOutOfStockState) {
      return;
    }

    const oldValue = previous.status === 'OUT_OF_STOCK' ? 0 : Math.max(1, previous.stock);
    const newValue = merged.status === 'OUT_OF_STOCK' ? 0 : Math.max(1, merged.stock);

    pushLiveEvent({
      id: crypto.randomUUID(),
      kind: 'STOCK_UPDATE',
      productId: merged.id,
      productName: merged.name,
      productSlug: merged.slug,
      oldValue,
      newValue,
      at: Date.now(),
    });
  }, [productUpdatedData, pushLiveEvent, upsertSnapshot]);

  React.useEffect(() => {
    const incoming = stockChangedData?.productStockChanged;
    if (!incoming) {
      return;
    }

    const { previous, merged } = upsertSnapshot(incoming);

    pushLiveEvent({
      id: crypto.randomUUID(),
      kind: 'STOCK_UPDATE',
      productId: merged.id,
      productName: merged.name,
      productSlug: merged.slug,
      oldValue: previous?.stock ?? merged.stock,
      newValue: merged.stock,
      at: Date.now(),
    });
  }, [stockChangedData, pushLiveEvent, upsertSnapshot]);

  React.useEffect(() => {
    const payload = priceUpdatedData?.priceUpdated;
    if (!payload?.product) {
      return;
    }

    const { merged } = upsertSnapshot(payload.product);

    if (payload.oldPrice === payload.newPrice) {
      return;
    }

    pushLiveEvent({
      id: crypto.randomUUID(),
      kind: 'PRICE_UPDATE',
      productId: merged.id,
      productName: merged.name,
      productSlug: merged.slug,
      oldValue: payload.oldPrice,
      newValue: payload.newPrice,
      at: Date.now(),
    });
  }, [priceUpdatedData, pushLiveEvent, upsertSnapshot]);

  const value = React.useMemo<LiveCatalogContextValue>(
    () => ({
      productsById,
      recentEventsByProductId,
      hotProductIds,
      activeToast,
      primeProduct,
      dismissActiveToast,
    }),
    [
      activeToast,
      dismissActiveToast,
      hotProductIds,
      primeProduct,
      productsById,
      recentEventsByProductId,
    ],
  );

  return (
    <LiveCatalogContext.Provider value={value}>
      {children}
      <GlobalLiveUpdateToast />
    </LiveCatalogContext.Provider>
  );
}

export function useLiveCatalog() {
  const context = React.useContext(LiveCatalogContext);
  if (!context) {
    throw new Error('useLiveCatalog must be used inside LiveCatalogProvider');
  }

  return context;
}

export function useLiveProduct(baseProduct: Product) {
  const { productsById, recentEventsByProductId, hotProductIds, primeProduct } =
    useLiveCatalog();

  React.useEffect(() => {
    primeProduct(baseProduct);
  }, [baseProduct, primeProduct]);

  const liveSnapshot = productsById[baseProduct.id];

  const product = React.useMemo<Product>(() => {
    if (!liveSnapshot) {
      return baseProduct;
    }

    return {
      ...baseProduct,
      name: liveSnapshot.name,
      slug: liveSnapshot.slug,
      price: liveSnapshot.price,
      stock: liveSnapshot.stock,
      status: liveSnapshot.status,
      brand: liveSnapshot.brand ?? baseProduct.brand,
      category: liveSnapshot.category ?? baseProduct.category,
    };
  }, [baseProduct, liveSnapshot]);

  return {
    product,
    event: recentEventsByProductId[baseProduct.id],
    isHot: Boolean(hotProductIds[baseProduct.id]),
  };
}

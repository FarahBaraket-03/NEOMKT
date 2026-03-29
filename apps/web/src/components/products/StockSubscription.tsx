'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useSubscription } from '@apollo/client';
import { PRODUCT_STOCK_CHANGED_SUBSCRIPTION } from '@/gql/documents';
import { useToast } from '@/components/ui/Toast';

export default function StockSubscription({ productId }: { productId: string }) {
  const [flashVisible, setFlashVisible] = useState(false);
  const { pushToast } = useToast();
  const { data } = useSubscription(PRODUCT_STOCK_CHANGED_SUBSCRIPTION);

  useEffect(() => {
    if (!data?.productStockChanged || data.productStockChanged.id !== productId) {
      return;
    }

    setFlashVisible(true);
    const timer = setTimeout(() => setFlashVisible(false), 1500);

    pushToast({
      title: 'STOCK UPDATE DETECTED',
      description: `Stock is now ${data.productStockChanged.stock}`,
      variant: 'info',
    });

    return () => clearTimeout(timer);
  }, [data, pushToast]);

  if (!flashVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 cyber-chamfer-sm border border-accent bg-card px-4 py-2 font-sharetech uppercase tracking-[0.16em] text-accent animate-pulse">
      &gt; STOCK SIGNAL UPDATED
    </div>
  );
}

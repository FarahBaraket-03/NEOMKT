'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { LiveCatalogProvider } from './LiveCatalogContext';
import WishlistProductUpdatesSubscription from './WishlistProductUpdatesSubscription';

export default function RealtimeProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <LiveCatalogProvider>
        <WishlistProductUpdatesSubscription />
        {children}
      </LiveCatalogProvider>
    </ToastProvider>
  );
}

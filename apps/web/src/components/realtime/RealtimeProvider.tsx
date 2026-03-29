'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { LiveCatalogProvider } from './LiveCatalogContext';

export default function RealtimeProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <LiveCatalogProvider>{children}</LiveCatalogProvider>
    </ToastProvider>
  );
}

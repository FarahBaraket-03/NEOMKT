'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  pushToast: (item: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

const variantStyles: Record<'success' | 'error' | 'info', string> = {
  success: 'border-accent text-accent',
  error: 'border-destructive text-destructive',
  info: 'border-accentTertiary text-accentTertiary',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const pushToast = React.useCallback((item: Omit<ToastItem, 'id'>) => {
    setToasts((prev) => [
      ...prev,
      {
        ...item,
        id: crypto.randomUUID(),
      },
    ]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ pushToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={cn(
              'cyber-chamfer border bg-card px-4 py-3 mb-3 shadow-neon',
              variantStyles[toast.variant ?? 'info'],
            )}
            duration={3000}
            onOpenChange={(open) => {
              if (!open) {
                removeToast(toast.id);
              }
            }}
          >
            <ToastPrimitive.Title className="font-sharetech uppercase tracking-[0.2em]">
              &gt; {toast.title}
            </ToastPrimitive.Title>
            {toast.description ? (
              <ToastPrimitive.Description className="font-jetbrains text-xs text-foreground/80 mt-1">
                {toast.description}
              </ToastPrimitive.Description>
            ) : null}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[10000] w-[360px] max-w-[90vw]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}

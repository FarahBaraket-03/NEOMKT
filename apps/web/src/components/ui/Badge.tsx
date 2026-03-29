import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'tertiary' | 'muted' | 'destructive';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-accent/20 text-accent border border-accent/50',
  secondary: 'bg-accentSecondary/20 text-accentSecondary border border-accentSecondary/50',
  tertiary: 'bg-accentTertiary/20 text-accentTertiary border border-accentTertiary/50',
  muted: 'bg-muted text-mutedForeground border border-border',
  destructive: 'bg-destructive/20 text-destructive border border-destructive/50',
};

export default function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'cyber-chamfer-sm inline-flex items-center px-2 py-1 text-xs font-sharetech uppercase tracking-[0.2em]',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

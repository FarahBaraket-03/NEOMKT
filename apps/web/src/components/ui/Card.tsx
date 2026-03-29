import * as React from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'terminal' | 'holographic';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const cardVariantClasses: Record<CardVariant, string> = {
  default:
    'bg-card border border-border cyber-chamfer transition-all hover:-translate-y-1 hover:border-accent hover:shadow-neon',
  terminal: 'bg-background border border-border cyber-chamfer relative pt-10',
  holographic:
    'bg-muted/30 border border-accent/30 shadow-neon backdrop-blur-sm cyber-chamfer relative overflow-hidden',
};

export default function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariantClasses[variant], className)} {...props}>
      {variant === 'terminal' ? (
        <div className="absolute top-3 left-4 flex items-center gap-2">
          <span className="h-2 w-2 bg-[#ff5f56]" />
          <span className="h-2 w-2 bg-[#ffbd2e]" />
          <span className="h-2 w-2 bg-[#27c93f]" />
        </div>
      ) : null}
      {variant === 'holographic' ? (
        <>
          <span className="absolute top-2 left-2 h-3 w-3 border-t border-l border-accent" />
          <span className="absolute top-2 right-2 h-3 w-3 border-t border-r border-accent" />
          <span className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-accent" />
          <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-accent" />
        </>
      ) : null}
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pt-5 pb-3', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6 pt-2', className)} {...props} />;
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionVariant = 'default' | 'terminal' | 'grid';

const variants: Record<SectionVariant, string> = {
  default: '',
  terminal: 'bg-card/50 border-y border-border',
  grid: 'cyber-grid',
};

export default function Section({
  title,
  subtitle,
  variant = 'default',
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  variant?: SectionVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('py-24 lg:py-32', variants[variant], className)}>
      {(title || subtitle) && (
        <div className="mb-12 border-b border-border/50 pb-6">
          {title ? (
            <h2 className="font-orbitron font-bold uppercase tracking-widest text-3xl md:text-5xl text-foreground flex items-center gap-3">
              <span className="text-accent animate-pulse">#</span> {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-3 text-mutedForeground font-mono text-sm tracking-widest uppercase">
              // {subtitle}
            </p>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}

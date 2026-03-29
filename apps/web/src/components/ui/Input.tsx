import * as React from 'react';
import { cn } from '@/lib/utils';

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-jetbrains">&gt;</span>
      <input
        className={cn(
          'cyber-chamfer-sm h-11 w-full bg-input border border-border pl-8 pr-3 text-sm font-jetbrains text-foreground placeholder:text-mutedForeground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 focus:shadow-neon-sm',
          className,
        )}
        {...props}
      />
    </div>
  );
}

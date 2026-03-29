import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'glitch' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-background hover:shadow-[var(--box-shadow-neon)]",
  secondary: "bg-transparent border-2 border-accentSecondary text-accentSecondary hover:bg-accentSecondary hover:text-background hover:shadow-[var(--box-shadow-neon-secondary)]",
  outline: "bg-transparent border border-border text-foreground hover:border-accent hover:text-accent hover:shadow-[var(--box-shadow-neon)]",
  ghost: "bg-transparent text-foreground hover:bg-accent/10 hover:text-accent",
  glitch: "bg-accent text-background border-transparent cyber-glitch hover:brightness-110 shadow-[var(--box-shadow-neon)]",
  destructive: "bg-destructive text-background border-transparent hover:brightness-110",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

export default function Button({
  className,
  children,
  variant = 'default',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'cyber-chamfer-sm inline-flex items-center justify-center gap-2 font-mono uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      data-text={typeof children === 'string' ? children : undefined}
      {...props}
    >
      {isLoading ? <span className="animate-blink">LOADING...</span> : children}
    </button>
  );
}

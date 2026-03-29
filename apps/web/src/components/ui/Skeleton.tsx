import { cn } from '@/lib/utils';

export default function Skeleton({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'cyberpunk';
}) {
  return (
    <div
      className={cn(
        'cyber-chamfer-sm animate-pulse',
        variant === 'default'
          ? 'bg-gradient-to-r from-muted via-border to-muted'
          : 'bg-gradient-to-r from-muted via-accent/20 to-muted',
        className,
      )}
    />
  );
}

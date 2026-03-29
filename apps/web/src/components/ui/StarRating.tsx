'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (next: number) => void;
  readOnly?: boolean;
  className?: string;
}

export default function StarRating({ value, onChange, readOnly = true, className }: StarRatingProps) {
  const rounded = Math.round(value);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const nextValue = index + 1;
          const filled = nextValue <= rounded;
          return (
            <button
              key={nextValue}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(nextValue)}
              className="p-0.5"
            >
              <Star className={filled ? 'h-4 w-4 text-accent fill-accent' : 'h-4 w-4 text-border'} />
            </button>
          );
        })}
      </div>
      <span className="font-sharetech text-xs text-mutedForeground">({value.toFixed(1)})</span>
    </div>
  );
}

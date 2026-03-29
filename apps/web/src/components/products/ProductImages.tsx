'use client';

import { useState } from 'react';
import SmartImage from '@/components/ui/SmartImage';
import { resolveImageUrl } from '@/lib/utils';

export default function ProductImages({ images, name, category, productId }: { images: string[]; name: string; category?: string; productId?: string }) {
  const normalizedImages = images.map((src) => resolveImageUrl(src));
  const uniqueImages = [...new Set(normalizedImages)];
  const safeImages = uniqueImages.length > 0 ? uniqueImages : [resolveImageUrl(undefined)];
  const [active, setActive] = useState(safeImages[0]);

  const displayId = productId ? productId.substring(0, 6).toUpperCase() : name.substring(0, 6).toUpperCase();

  return (
    <div className="space-y-4">
      <div className="relative aspect-square md:aspect-auto md:h-[500px] cyber-chamfer border border-border overflow-hidden group bg-black">
        <div className="absolute inset-0 bg-circuit opacity-20 group-hover:opacity-40 transition-opacity z-10 pointer-events-none" />
        
        {/* Scanlines effect overlay */}
        <div className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-overlay" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, black 3px)' }} />
        
        <SmartImage 
          src={active} 
          alt={name} 
          fill 
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 contrast-125 p-4" 
        />
        
        {category && (
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-background/80 backdrop-blur border border-accent/50 px-3 py-1 font-mono text-accent text-sm uppercase tracking-widest">
              {category}
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-background/80 backdrop-blur border border-border px-3 py-1 font-mono text-mutedForeground text-xs uppercase tracking-widest cyber-chamfer-sm">
            ID: {displayId}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {safeImages.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            className={`relative h-20 cyber-chamfer-sm border overflow-hidden transition-colors ${active === src ? 'border-accent shadow-[0_0_8px_rgba(0,255,136,0.3)]' : 'border-border hover:border-accent/50'}`}
            onClick={() => setActive(src)}
          >
            <div className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-overlay" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, black 3px)' }} />
            <SmartImage src={src} alt={`${name} thumb`} fill className="object-cover grayscale hover:grayscale-0 transition-all p-1" />
          </button>
        ))}
      </div>
    </div>
  );
}

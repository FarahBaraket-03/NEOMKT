import React from 'react';
import { cn } from '@/lib/utils';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={cn("w-full h-full text-accent transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_var(--color-accent)]", className)}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagon Background with chamfered look */}
      <path 
        d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="currentColor"
        fillOpacity="0.05"
        className="drop-shadow-[0_0_8px_currentColor]"
      />
      
      {/* Glitch / Circuit lines */}
      <path d="M5 25 L30 25 L50 5" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M95 75 L70 75 L50 95" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      
      {/* The 'N' */}
      <path 
        d="M30 70 L30 30 L70 70 L70 30" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinejoin="miter"
        strokeLinecap="square"
        className="drop-shadow-[0_0_12px_currentColor]"
      />
      
      {/* Decorative dots */}
      <circle cx="30" cy="30" r="4" fill="currentColor" />
      <circle cx="70" cy="70" r="4" fill="currentColor" />
      
      {/* Inner tech details */}
      <path d="M50 20 L50 10" stroke="currentColor" strokeWidth="2" />
      <path d="M50 80 L50 90" stroke="currentColor" strokeWidth="2" />
      <path d="M20 50 L10 50" stroke="currentColor" strokeWidth="2" />
      <path d="M80 50 L90 50" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
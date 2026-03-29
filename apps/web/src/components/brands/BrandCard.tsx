import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { Brand } from '@/gql/__generated__';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link href={`/brands/${brand.slug}`} className="group block h-full">
      <Card variant="terminal" className="h-full flex flex-col hover:border-accent hover:shadow-[var(--box-shadow-neon)] transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-16 w-16 border-2 border-accent flex items-center justify-center shadow-[var(--box-shadow-neon-sm)] group-hover:shadow-[var(--box-shadow-neon)] transition-shadow bg-background text-accent font-orbitron text-xl">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
                className="h-full w-full object-cover p-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              getInitials(brand.name)
            )}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-mutedForeground group-hover:text-accent transition-colors lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 pb-4 pt-4">
          <h3 className="font-orbitron font-bold uppercase text-2xl tracking-widest group-hover:text-accent transition-colors mb-2">
            {brand.name}
          </h3>
          <p className="mt-1 text-sm font-mono text-mutedForeground leading-relaxed flex-1">
            {`${brand.country} ${brand.foundedYear ? `// ${brand.foundedYear}` : ''}`}
          </p>
          
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono uppercase tracking-widest text-accentSecondary opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-2">
              <span className="text-mutedForeground">{brand.products?.length ?? 0} NODES</span>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <span>OPEN_NODE</span>
              <span className="animate-blink">&gt;</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

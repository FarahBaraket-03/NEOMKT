import { Cpu } from 'lucide-react';
import type { ProductSpec } from '@/gql/__generated__';

export default function SpecsTable({ specs }: { specs: ProductSpec[] }) {
  if (!specs || specs.length === 0) return null;

  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-xl font-bold font-orbitron uppercase tracking-widest border-b border-border pb-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-accent/20 flex items-center justify-center border border-accent/50">
          <Cpu className="w-5 h-5 text-accent" />
        </div>
        TECHNICAL_SPECS
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {specs.map((spec) => (
          <div key={spec.id} className="bg-black/40 border border-border/50 p-4 cyber-chamfer-sm flex flex-col hover:border-accent/50 transition-colors group">
            <span className="text-xs font-mono text-mutedForeground uppercase tracking-wider mb-2 opacity-70 group-hover:text-accent transition-colors">{spec.key}</span>
            <span className="font-mono text-white text-sm md:text-base uppercase">
              {spec.value}
              {spec.unit ? ` ${spec.unit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

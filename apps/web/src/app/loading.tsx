export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-xl cyber-chamfer border border-accent/50 bg-card p-6">
        <p className="font-sharetech uppercase tracking-[0.24em] text-accent mb-4">&gt;_ LOADING SYSTEM</p>
        <div className="h-2 bg-muted overflow-hidden cyber-chamfer-sm">
          <div className="h-full w-1/3 bg-accent animate-[scanline_1.2s_linear_infinite]" />
        </div>
      </div>
    </div>
  );
}

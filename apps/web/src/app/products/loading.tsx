export default function ProductsLoading() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-5xl mx-auto cyber-chamfer border border-accent/50 bg-card p-6">
        <p className="font-sharetech uppercase tracking-[0.2em] text-accent">&gt;_ LOADING PRODUCT GRID</p>
        <div className="mt-4 h-2 bg-muted overflow-hidden cyber-chamfer-sm">
          <div className="h-full w-1/2 bg-accent animate-[scanline_1s_linear_infinite]" />
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="cyber-chamfer border border-border bg-card p-10 max-w-2xl w-full text-center">
        <h1 data-text="404" className="cyber-glitch font-orbitron text-7xl text-accent">404</h1>
        <p className="font-orbitron uppercase tracking-widest text-destructive mt-4">&gt; 404 // SIGNAL LOST</p>
      </div>
    </div>
  );
}

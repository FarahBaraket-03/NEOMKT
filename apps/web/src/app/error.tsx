'use client';

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="cyber-chamfer border border-destructive/60 bg-card p-10 max-w-2xl w-full">
        <h1 className="font-orbitron text-4xl text-destructive uppercase">&gt; ERROR 500 // SYSTEM FAILURE</h1>
        <p className="mt-4 font-jetbrains text-mutedForeground">{error.message}</p>
      </div>
    </div>
  );
}

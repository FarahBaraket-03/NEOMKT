import Card, { CardContent, CardHeader } from '@/components/ui/Card';

const query = `query LatestProducts {
  products(limit: 3, sortBy: "created_at", sortOrder: DESC) {
    id
    name
    stock
    avgRating
  }
}`;

export default function TerminalSection() {
  return (
    <section className="py-24 lg:py-28 bg-background">
      <Card variant="terminal" className="max-w-5xl mx-auto">
        <CardHeader>
          <h3 className="font-orbitron text-3xl uppercase">&gt;_ GRAPHQL TERMINAL</h3>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto cyber-chamfer-sm border border-border bg-card p-4 font-jetbrains text-sm leading-relaxed">
            <code>
              {query
                .split('\n')
                .map((line) => `> ${line}`)
                .join('\n')}
              {'\n'}
              <span className="animate-blink text-accent">|</span>
            </code>
          </pre>
        </CardContent>
      </Card>
    </section>
  );
}

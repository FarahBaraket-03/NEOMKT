'use client';

import { useState, useEffect } from 'react';
import { Database, Zap, FileJson, Play, Activity, AlertCircle } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type QueryType = 'getProduct' | 'listProducts' | 'getBrand' | 'aboutNeomkt';

interface ErrorResponse {
  errors?: Array<{ message: string }>;
}

export default function ApiDocsPage() {
  const [activeQuery, setActiveQuery] = useState<QueryType>('aboutNeomkt');
  const [isExecuting, setIsExecuting] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState('https://api.neomkt.net/graphql');
  const [queryText, setQueryText] = useState('');
  const [variables, setVariables] = useState('{}');

  const queries: Record<QueryType, { label: string, query: string, doc: React.ReactNode }> = {
    aboutNeomkt: {
      label: 'aboutNeomkt',
      query: `query GetProducts {\n  products(limit: 5) {\n    id\n    name\n    price\n    stock\n  }\n}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accent">type</span> <span className="text-white">Query</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">products: <span className="text-white">[Product]</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Retrieves a list of products from the NEOMKT catalog with pricing and inventory data.
          </p>
        </>
      ),
    },
    getBrand: {
      label: 'getBrand',
      query: `query GetBrands {\n  brands {\n    id\n    name\n    country\n  }\n}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accent">type</span> <span className="text-white">Query</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">brands: <span className="text-white">[Brand]</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Retrieves all authorized brands and megacorps in the NEOMKT network.
          </p>
        </>
      ),
    },
    getProduct: {
      label: 'getProduct',
      query: `query GetProductById($id: String!) {\n  product(id: $id) {\n    id\n    name\n    price\n    stock\n  }\n}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accent">type</span> <span className="text-white">Query</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">product(id: String!): <span className="text-white">Product</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Fetches a single product by ID with full details and specifications.
          </p>
        </>
      ),
    },
    listProducts: {
      label: 'listProducts',
      query: `query ListAllProducts {\n  products {\n    id\n    name\n    price\n    avgRating\n  }\n}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accent">type</span> <span className="text-white">Query</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">products: <span className="text-white">[Product]</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Scans the entire NEOMKT network for all available hardware including ratings.
          </p>
        </>
      ),
    }
  };

  // Initialize query text on component mount and when active query changes
  useEffect(() => {
    setQueryText(queries[activeQuery].query);
    setResponse(null);
    setError(null);
  }, [activeQuery]);

  // Set endpoint on initial load
  useEffect(() => {
    setEndpoint(process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL || 'http://localhost:4000/graphql');
  }, []);

  const handleExecute = async () => {
    setIsExecuting(true);
    setResponse(null);
    setError(null);

    try {
      let parsedVariables = {};
      try {
        parsedVariables = JSON.parse(variables);
      } catch {
        setError('Invalid JSON in variables');
        setIsExecuting(false);
        return;
      }

      const graphqlRequest = {
        query: queryText,
        variables: parsedVariables,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlRequest),
      });

      const data = (await res.json()) as { data?: unknown; errors?: Array<{ message: string }> } & ErrorResponse;

      if (data.errors) {
        setError(data.errors.map((err) => err.message).join('\n'));
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const syntaxHighlight = (text: string): string => {
    let formatted = text
      .replace(/(&)/g, '&amp;')
      .replace(/(<)/g, '&lt;')
      .replace(/(>)/g, '&gt;')
      .replace(/"([^"]*)"/g, '<span class="text-accent">"$1"</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="text-secondary">$1</span>')
      .replace(/: \s*(-?\d+\.?\d*)/g, ': <span class="text-accentTertiary">$1</span>')
      .replace(/^(\s*)"([^"]+)"/m, '$1<span class="text-white">"$2"</span>');
    return formatted;
  };

  return (
    <PageContainer>
      <div className="py-8 animate-in fade-in duration-500">
        
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-border pb-6 mb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-shadow-neon font-orbitron text-white">
              GRAPHQL_NEXUS
            </h1>
            <div className="flex items-center gap-3 mt-3 text-mutedForeground font-mono uppercase tracking-widest text-sm">
              <Database className="w-4 h-4 text-accent" />
              <span>// API_PLAYGROUND_V2.0.4</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 border border-accent/30 bg-accent/5 cyber-chamfer-sm text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-mutedForeground">ENDPOINT:</span>
            <span className="text-accent tracking-wider break-all">{endpoint}</span>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[70vh] min-h-[600px]">
          
          {/* Column 1: Schema */}
          <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
            <Card variant="terminal" className="flex-1 bg-black/60 border-accent/20 flex flex-col min-h-0 items-stretch overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-accent/20 bg-accent/5 shrink-0">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-accent" />
                  <h3 className="font-orbitron text-sm uppercase tracking-widest text-white">SCHEMA_EXPLORER</h3>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto min-h-0">
                <div className="p-4">
                  <p className="text-xs font-mono text-mutedForeground mb-4 opacity-70">// AVAILABLE QUERIES</p>
                  <ul className="space-y-2">
                    {(Object.keys(queries) as QueryType[]).map((key) => (
                      <li key={key}>
                        <button
                          onClick={() => setActiveQuery(key)}
                          className={cn(
                            "w-full text-left px-3 py-2 font-mono text-sm tracking-widest transition-all",
                            activeQuery === key 
                              ? "bg-accent/10 border border-accent text-accent" 
                              : "text-mutedForeground hover:text-white hover:bg-white/5 border border-transparent"
                          )}
                        >
                          {activeQuery === key && <span className="mr-2">&gt;</span>}
                          {queries[key].label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

              <Card variant="terminal" className="h-1/3 bg-black/60 border-accentTertiary/20 flex flex-col items-stretch overflow-hidden min-h-0">
                <CardHeader className="py-3 px-4 border-b border-accentTertiary/20 bg-accentTertiary/5 shrink-0">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accentTertiary" />
                    <h3 className="font-orbitron text-sm uppercase tracking-widest text-white">DOCUMENTATION</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 overflow-y-auto w-full min-h-0">
                {queries[activeQuery].doc}
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Query Editor */}
          <div className="lg:col-span-5 flex flex-col min-h-0">
            <Card variant="terminal" className="flex-1 bg-black/60 border-accent/30 flex flex-col min-h-0 items-stretch overflow-hidden relative">
              <CardHeader className="py-3 px-4 border-b border-accent/30 bg-black shrink-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <h3 className="font-orbitron text-sm uppercase tracking-widest text-white">QUERY_EDITOR</h3>
                </div>
                <Button 
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="h-8 px-6 bg-accent text-black font-bold font-mono tracking-widest hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,136,0.5)] border-none disabled:opacity-50"
                >
                  {isExecuting ? 'EXECUTING...' : 'EXECUTE'}
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col w-full h-full pb-0 relative min-h-0">
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="flex-1 p-4 bg-black/40 text-white font-mono text-sm outline-none resize-none border-none focus:ring-0 whitespace-pre-wrap"
                  style={{ color: '#e2e8f0', caretColor: '#00ff88' }}
                  spellCheck="false"
                />
                
                <div className="h-1/4 border-t border-border/50 bg-black/60 flex flex-col mt-auto shrink-0 w-full">
                  <div className="py-2 px-4 border-b border-border/30 bg-black/40">
                    <span className="font-mono text-[10px] uppercase text-mutedForeground tracking-widest">QUERY VARIABLES</span>
                  </div>
                  <textarea
                    value={variables}
                    onChange={(e) => setVariables(e.target.value)}
                    className="flex-1 p-4 bg-black/40 text-foreground/70 font-mono text-xs outline-none resize-none border-none focus:ring-0 overflow-y-auto"
                    style={{ caretColor: '#00ff88' }}
                    spellCheck="false"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Server Response */}
          <div className="lg:col-span-4 flex flex-col min-h-0">
            <Card variant="terminal" className="flex-1 bg-black/60 border-accent/20 flex flex-col min-h-0 items-stretch overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-accent/20 bg-accent/5 shrink-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-accent" />
                  <h3 className="font-orbitron text-sm uppercase tracking-widest text-white">SERVER_RESPONSE</h3>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto min-h-0">
                {isExecuting ? (
                  <div className="flex items-center gap-3 text-accent font-mono text-sm animate-pulse">
                    <div className="w-2 h-4 bg-accent" />
                    PROCESSING_TELEMETRY...
                  </div>
                ) : error ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-destructive font-mono text-xs">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <pre className="whitespace-pre-wrap break-words">{error}</pre>
                    </div>
                  </div>
                ) : response ? (
                  <pre className="font-mono text-xs text-accent leading-relaxed whitespace-pre-wrap">
                    {response.split('\n').map((line, idx) => {
                      const formatted = syntaxHighlight(line);
                      const displayLine = !formatted.trim() ? '&nbsp;' : formatted;
                      return (
                        <div key={idx} dangerouslySetInnerHTML={{ __html: displayLine }} />
                      );
                    })}
                  </pre>
                ) : (
                  <p className="text-mutedForeground font-mono text-sm opacity-70">
                    // CLICK EXECUTE TO RUN QUERY...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}

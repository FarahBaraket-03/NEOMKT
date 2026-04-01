'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Database, Zap, FileJson, Play, Activity, AlertCircle, Lock } from 'lucide-react';
import { createClient } from 'graphql-ws';
import PageContainer from '@/components/layout/PageContainer';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/AuthContext';
import { getBrowserSupabaseClient } from '@/lib/auth/supabase';
import { cn } from '@/lib/utils';

type QueryType =
  | 'getProduct'
  | 'listProducts'
  | 'filterProducts'
  | 'getBrand'
  | 'aboutNeomkt'
  | 'subscriptionProductUpdated'
  | 'subscriptionProductStockChanged'
  | 'subscriptionPriceUpdated'
  | 'adminCreateBrandMutation'
  | 'adminUpdateBrandMutation'
  | 'adminDeleteBrandMutation';
type UserRole = 'PUBLIC' | 'USER' | 'ADMIN';
type OperationType = 'query' | 'mutation' | 'subscription';

interface QueryDefinition {
  label: string;
  query: string;
  doc: React.ReactNode;
  requiresAdmin?: boolean;
  requiresAuth?: boolean;
  defaultVariables?: string;
  operationType?: OperationType;
}

interface ErrorResponse {
  errors?: Array<{ message: string }>;
}

function formatSubscriptionError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error, null, 2);
}

function deriveWsEndpoint(httpEndpoint: string): string {
  const configuredWsEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL;
  if (configuredWsEndpoint) {
    return configuredWsEndpoint;
  }

  try {
    const url = new URL(httpEndpoint);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
  } catch {
    return 'ws://localhost:4000/graphql';
  }
}

function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'USER' || normalized === 'PUBLIC') {
    return normalized;
  }

  return null;
}

export default function ApiDocsPage() {
  const defaultEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL || 'http://localhost:4000/graphql';
  const defaultWsEndpoint = deriveWsEndpoint(defaultEndpoint);
  const [activeQuery, setActiveQuery] = useState<QueryType>('aboutNeomkt');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState(defaultEndpoint);
  const [wsEndpoint] = useState(defaultWsEndpoint);
  const [queryText, setQueryText] = useState('');
  const [variables, setVariables] = useState('{}');
  const [viewerRole, setViewerRole] = useState<UserRole>('PUBLIC');
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const subscriptionDisposeRef = useRef<(() => void) | null>(null);

  const { user, session, isLoading: isAuthLoading } = useAuth();
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);

  const queries: Record<QueryType, QueryDefinition> = {
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
    },
    filterProducts: {
      label: 'filterProducts',
      operationType: 'query',
      query: `query FilterProducts($status: ProductStatus, $minPrice: Float, $maxPrice: Float, $search: String, $limit: Int) {\n  products(\n    status: $status\n    minPrice: $minPrice\n    maxPrice: $maxPrice\n    search: $search\n    sortBy: "price"\n    sortOrder: ASC\n    limit: $limit\n  ) {\n    id\n    name\n    price\n    stock\n    status\n  }\n}`,
      defaultVariables: `{
  "status": "ACTIVE",
  "minPrice": 100,
  "maxPrice": 3000,
  "search": "pro",
  "limit": 10
}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accent">type</span> <span className="text-white">Query</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">products(status, minPrice, maxPrice, search...): <span className="text-white">[Product]</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Filters the catalog by status, price range, and keyword search to test query arguments.
          </p>
        </>
      ),
    },
    subscriptionProductUpdated: {
      label: 'subscriptionProductUpdated',
      operationType: 'subscription',
      requiresAuth: true,
      query: `subscription ProductUpdated($productId: ID) {\n  productUpdated(productId: $productId) {\n    id\n    name\n    slug\n    price\n    stock\n    status\n    updatedAt\n  }\n}`,
      defaultVariables: `{
  "productId": "replace-with-product-id-or-null"
}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accent">type</span> <span className="text-white">Subscription</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">productUpdated(productId: ID): <span className="text-white">Product</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Streams product updates in real time. Use productId to listen to one specific product.
          </p>
        </>
      ),
    },
    subscriptionProductStockChanged: {
      label: 'subscriptionStockByProduct',
      operationType: 'subscription',
      requiresAuth: true,
      query: `subscription ProductStockChanged($productId: ID) {\n  productStockChanged(productId: $productId) {\n    id\n    name\n    slug\n    stock\n    status\n    updatedAt\n  }\n}`,
      defaultVariables: `{
  "productId": "replace-with-product-id"
}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accent">type</span> <span className="text-white">Subscription</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">productStockChanged(productId: ID): <span className="text-white">Product</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Real-time stock feed for a specific product (ideal for wishlist watch behavior).
          </p>
        </>
      ),
    },
    subscriptionPriceUpdated: {
      label: 'subscriptionPriceByProduct',
      operationType: 'subscription',
      requiresAuth: true,
      query: `subscription PriceUpdated($productId: ID) {\n  priceUpdated(productId: $productId) {\n    oldPrice\n    newPrice\n    product {\n      id\n      name\n      slug\n      price\n      updatedAt\n    }\n  }\n}`,
      defaultVariables: `{
  "productId": "replace-with-product-id"
}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accent">type</span> <span className="text-white">Subscription</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">priceUpdated(productId: ID): <span className="text-white">PriceUpdatedPayload</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Live price update stream with old/new price payload for one product.
          </p>
        </>
      ),
    },
    adminCreateBrandMutation: {
      label: 'adminCreateBrand',
      requiresAdmin: true,
      operationType: 'mutation',
      query: `mutation AdminCreateBrand($input: CreateBrandInput!) {\n  createBrand(input: $input) {\n    id\n    name\n    slug\n    country\n  }\n}`,
      defaultVariables: `{
  "input": {
    "name": "NEOMKT Admin Test Brand",
    "slug": "neomkt-admin-test-brand-change-me",
    "country": "JP",
    "description": "Temporary mutation test from API docs"
  }
}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accentTertiary">type</span> <span className="text-white">Mutation</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">createBrand(input: CreateBrandInput!): <span className="text-white">Brand</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-accentTertiary text-xs uppercase tracking-widest font-mono mb-2">ADMIN ONLY</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Tests an administrative write operation. Normal users can inspect this mutation but cannot execute it.
          </p>
        </>
      ),
    },
    adminUpdateBrandMutation: {
      label: 'adminUpdateBrand',
      requiresAdmin: true,
      operationType: 'mutation',
      query: `mutation AdminUpdateBrand($id: ID!, $input: UpdateBrandInput!) {\n  updateBrand(id: $id, input: $input) {\n    id\n    name\n    slug\n    country\n    description\n  }\n}`,
      defaultVariables: `{
  "id": "replace-with-brand-id",
  "input": {
    "name": "NEOMKT Updated Brand",
    "description": "Updated from API docs mutation test"
  }
}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accentTertiary">type</span> <span className="text-white">Mutation</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">updateBrand(id: ID!, input: UpdateBrandInput!): <span className="text-white">Brand</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-accentTertiary text-xs uppercase tracking-widest font-mono mb-2">ADMIN ONLY</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Updates an existing brand by ID. Locked for normal users.
          </p>
        </>
      ),
    },
    adminDeleteBrandMutation: {
      label: 'adminDeleteBrand',
      requiresAdmin: true,
      operationType: 'mutation',
      query: `mutation AdminDeleteBrand($id: ID!) {\n  deleteBrand(id: $id)\n}`,
      defaultVariables: `{
  "id": "replace-with-brand-id"
}`,
      doc: (
        <>
          <p className="text-secondary font-mono mb-2"><span className="text-accentTertiary">type</span> <span className="text-white">Mutation</span> {'{'}</p>
          <p className="pl-4 font-mono text-sm text-mutedForeground">deleteBrand(id: ID!): <span className="text-white">Boolean</span></p>
          <p className="font-mono mb-4">{'}'}</p>
          <p className="text-accentTertiary text-xs uppercase tracking-widest font-mono mb-2">ADMIN ONLY</p>
          <p className="text-mutedForeground text-xs leading-relaxed font-jetbrains">
            Deletes a brand by ID. This destructive mutation is locked for normal users.
          </p>
        </>
      ),
    },
  };

  const selectedOperation = queries[activeQuery];
  const isSubscriptionOperation = selectedOperation.operationType === 'subscription';
  const isAuthRequired = Boolean(selectedOperation.requiresAuth || selectedOperation.requiresAdmin);
  const isAuthenticationMissing = isAuthRequired && !session?.access_token;
  const isMutationLocked = Boolean(selectedOperation.requiresAdmin) && viewerRole !== 'ADMIN';
  const isSecurityStateLoading = isAuthLoading || isRoleLoading;

  // Initialize query text on component mount and when active query changes
  useEffect(() => {
    setQueryText(queries[activeQuery].query);
    setVariables(queries[activeQuery].defaultVariables ?? '{}');
    setResponse(null);
    setError(null);

    if (subscriptionDisposeRef.current) {
      subscriptionDisposeRef.current();
      subscriptionDisposeRef.current = null;
      setIsSubscriptionActive(false);
    }
  }, [activeQuery]);

  useEffect(() => () => {
    if (subscriptionDisposeRef.current) {
      subscriptionDisposeRef.current();
      subscriptionDisposeRef.current = null;
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const resolveViewerRole = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!user) {
        setViewerRole('PUBLIC');
        setIsRoleLoading(false);
        return;
      }

      setIsRoleLoading(true);

      const fallbackRole = normalizeRole(user.app_metadata?.role)
        ?? normalizeRole(user.user_metadata?.role)
        ?? 'USER';

      try {
        const { data, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle<{ role: UserRole }>();

        if (isCancelled) {
          return;
        }

        if (!roleError && data?.role) {
          setViewerRole(data.role);
        } else {
          setViewerRole(fallbackRole);
        }
      } catch {
        if (!isCancelled) {
          setViewerRole(fallbackRole);
        }
      } finally {
        if (!isCancelled) {
          setIsRoleLoading(false);
        }
      }
    };

    void resolveViewerRole();

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, supabase, user]);

  const handleExecute = async () => {
    if (isAuthenticationMissing) {
      setError('Authentication required. Please log in before running this operation.');
      return;
    }

    if (selectedOperation.requiresAdmin && viewerRole !== 'ADMIN') {
      setError('This mutation is locked. Admin role required.');
      return;
    }

    if (isSecurityStateLoading) {
      setError('Please wait, validating your access level...');
      return;
    }

    setIsExecuting(true);
    setResponse(null);
    setError(null);

    try {
      let parsedVariables: Record<string, unknown> = {};
      try {
        parsedVariables = JSON.parse(variables) as Record<string, unknown>;
      } catch {
        setError('Invalid JSON in variables');
        setIsExecuting(false);
        return;
      }

      if (isSubscriptionOperation) {
        const wsClient = createClient({
          url: wsEndpoint,
          connectionParams: session?.access_token
            ? {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            : {},
          shouldRetry: () => true,
          retryAttempts: 3,
        });

        let eventCount = 0;

        const dispose = wsClient.subscribe(
          {
            query: queryText,
            variables: parsedVariables,
          },
          {
            next: (payload) => {
              eventCount += 1;
              setResponse((previous) => {
                const line = JSON.stringify(payload, null, 2);
                if (!previous || previous.length === 0) {
                  return `EVENT #${eventCount}\n${line}`;
                }

                return `${previous}\n\nEVENT #${eventCount}\n${line}`;
              });
            },
            error: (subscriptionError) => {
              setError(`Subscription Error: ${formatSubscriptionError(subscriptionError)}`);
              setIsSubscriptionActive(false);
            },
            complete: () => {
              setIsSubscriptionActive(false);
            },
          },
        );

        subscriptionDisposeRef.current = dispose;
        setIsSubscriptionActive(true);
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
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
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

  const stopSubscription = () => {
    if (!subscriptionDisposeRef.current) {
      return;
    }

    subscriptionDisposeRef.current();
    subscriptionDisposeRef.current = null;
    setIsSubscriptionActive(false);
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
          {isSubscriptionOperation ? (
            <div className="flex items-center gap-3 px-4 py-2 border border-accentTertiary/40 bg-accentTertiary/10 cyber-chamfer-sm text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-accentTertiary animate-pulse" />
              <span className="text-mutedForeground">WS_ENDPOINT:</span>
              <span className="text-accentTertiary tracking-wider break-all">{wsEndpoint}</span>
            </div>
          ) : null}
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
                        {queries[key].requiresAdmin ? (
                          <div className="mb-1 flex items-center gap-2 px-3">
                            <Lock className="w-3 h-3 text-destructive" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-destructive/90">
                              admin only
                            </span>
                          </div>
                        ) : null}
                        <button
                          onClick={() => setActiveQuery(key)}
                          className={cn(
                            "w-full text-left px-3 py-2 font-mono text-sm tracking-widest transition-all",
                            activeQuery === key 
                              ? "bg-accent/10 border border-accent text-accent" 
                              : "text-mutedForeground hover:text-white hover:bg-white/5 border border-transparent",
                            queries[key].requiresAdmin && viewerRole !== 'ADMIN'
                              ? 'border-destructive/50 text-destructive/90'
                              : undefined,
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
                  onClick={isSubscriptionActive ? stopSubscription : handleExecute}
                  disabled={(isExecuting && !isSubscriptionActive) || isMutationLocked || isSecurityStateLoading || isAuthenticationMissing}
                  className="h-8 px-6 bg-accent text-black font-bold font-mono tracking-widest hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,136,0.5)] border-none disabled:opacity-50"
                >
                  {isSubscriptionActive
                    ? 'STOP_LISTENING'
                    : isExecuting
                    ? 'EXECUTING...'
                    : isSecurityStateLoading
                      ? 'CHECKING_ACCESS...'
                      : isAuthenticationMissing
                        ? 'LOGIN_REQUIRED'
                      : isMutationLocked
                        ? 'ADMIN_LOCKED'
                        : isSubscriptionOperation
                          ? 'START_LISTENING'
                          : 'EXECUTE'}
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col w-full h-full pb-0 relative min-h-0">
                {isAuthenticationMissing ? (
                  <div className="border-b border-accentSecondary/30 bg-accentSecondary/10 px-4 py-2">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-accentSecondary">
                      Login required for this operation.
                    </p>
                  </div>
                ) : null}
                {isMutationLocked ? (
                  <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-destructive">
                      Mutation execution locked for non-admin users.
                    </p>
                  </div>
                ) : null}
                {isSubscriptionActive ? (
                  <div className="border-b border-accentTertiary/30 bg-accentTertiary/10 px-4 py-2">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-accentTertiary">
                      Listening for live subscription events...
                    </p>
                  </div>
                ) : null}
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  readOnly={isMutationLocked || isSubscriptionActive}
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
                    readOnly={isMutationLocked || isSubscriptionActive}
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

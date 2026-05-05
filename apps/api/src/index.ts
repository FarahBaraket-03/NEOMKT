import { ApolloServer, type ApolloServerPlugin } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import http from 'node:http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import {
  parse,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql';
import { createSchema } from './schema/index.js';
import { resolvers } from './resolvers/index.js';
import {
  createContext,
  createWsContext,
} from './lib/context.js';
import { checkDatabaseHealth, supabaseAdmin } from './lib/supabase.js';
import { cleanupRealtime, initRealtime } from './lib/realtime.js';
import { env } from './lib/env.js';
import { logError } from './middleware/errorLogger.js';
import type { GraphQLContext } from './types/context.js';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 100;
const MAX_MUTATIONS_PER_WINDOW = 10;
const MAX_QUERY_DEPTH = 8;
const MAX_QUERY_FIELD_COUNT = 250;

interface GraphQLRequestBody {
  query?: string;
  operationName?: string | null;
}

interface QueryMetrics {
  maxDepth: number;
  fieldCount: number;
}

function mergeMetrics(current: QueryMetrics, next: QueryMetrics): QueryMetrics {
  return {
    maxDepth: Math.max(current.maxDepth, next.maxDepth),
    fieldCount: current.fieldCount + next.fieldCount,
  };
}

function collectSelectionMetrics(
  selectionSet: SelectionSetNode | undefined,
  fragments: Map<string, FragmentDefinitionNode>,
  depth: number,
  visitedFragments: Set<string>,
): QueryMetrics {
  if (!selectionSet) {
    return { maxDepth: Math.max(depth - 1, 0), fieldCount: 0 };
  }

  let metrics: QueryMetrics = {
    maxDepth: depth,
    fieldCount: 0,
  };

  for (const selection of selectionSet.selections) {
    if (selection.kind === 'Field') {
      const fieldName = selection.name.value;
      if (fieldName === '__schema' || fieldName === '__type' || fieldName === '__typename') {
        continue;
      }

      metrics.fieldCount += 1;
      const childMetrics = collectSelectionMetrics(
        selection.selectionSet,
        fragments,
        depth + 1,
        visitedFragments,
      );
      metrics = mergeMetrics(metrics, childMetrics);
      continue;
    }

    if (selection.kind === 'InlineFragment') {
      const inlineMetrics = collectSelectionMetrics(
        selection.selectionSet,
        fragments,
        depth,
        visitedFragments,
      );
      metrics = mergeMetrics(metrics, inlineMetrics);
      continue;
    }

    if (selection.kind === 'FragmentSpread') {
      const fragmentName = selection.name.value;
      if (visitedFragments.has(fragmentName)) {
        continue;
      }

      const fragment = fragments.get(fragmentName);
      if (!fragment) {
        continue;
      }

      const nextVisited = new Set(visitedFragments);
      nextVisited.add(fragmentName);
      const fragmentMetrics = collectSelectionMetrics(
        fragment.selectionSet,
        fragments,
        depth,
        nextVisited,
      );
      metrics = mergeMetrics(metrics, fragmentMetrics);
    }
  }

  return metrics;
}

function getQueryMetrics(query: string, operationName?: string | null): QueryMetrics | null {
  try {
    const parsed = parse(query);

    const fragments = new Map<string, FragmentDefinitionNode>();
    const operations: OperationDefinitionNode[] = [];

    for (const definition of parsed.definitions) {
      if (definition.kind === 'FragmentDefinition') {
        fragments.set(definition.name.value, definition);
      }

      if (definition.kind === 'OperationDefinition') {
        operations.push(definition);
      }
    }

    if (operations.length === 0) {
      return null;
    }

    const targetOperations = operationName
      ? operations.filter((operation) => operation.name?.value === operationName)
      : operations;

    if (targetOperations.length === 0) {
      return null;
    }

    return targetOperations.reduce<QueryMetrics>(
      (acc, operation) =>
        mergeMetrics(
          acc,
          collectSelectionMetrics(operation.selectionSet, fragments, 1, new Set<string>()),
        ),
      { maxDepth: 0, fieldCount: 0 },
    );
  } catch {
    return null;
  }
}

function getGraphQLRequestEntries(req: Request): GraphQLRequestBody[] {
  if (req.method === 'GET') {
    const { query, operationName } = req.query as Record<string, string | undefined>;
    return query ? [{ query, operationName }] : [];
  }

  const body = req.body as GraphQLRequestBody | GraphQLRequestBody[] | undefined;

  if (Array.isArray(body)) {
    return body;
  }

  return body ? [body] : [];
}

function isMutationQuery(query: string, operationName?: string | null): boolean {
  try {
    const parsed = parse(query);
    const operations = parsed.definitions.filter(
      (definition): definition is OperationDefinitionNode =>
        definition.kind === 'OperationDefinition',
    );

    if (operations.length === 0) {
      return false;
    }

    if (operationName) {
      const operation = operations.find(
        (definition) => definition.name?.value === operationName,
      );
      return operation?.operation === 'mutation';
    }

    return operations.some((definition) => definition.operation === 'mutation');
  } catch {
    return /^\s*mutation\b/i.test(query);
  }
}

function isMutationRequest(req: Request): boolean {
  const entries = getGraphQLRequestEntries(req);

  return entries.some((entry) =>
    typeof entry?.query === 'string'
      ? isMutationQuery(entry.query, entry.operationName)
      : false,
  );
}

function queryComplexityGuard(req: Request, res: Response, next: NextFunction): void {
  const entries = getGraphQLRequestEntries(req);

  for (const entry of entries) {
    if (typeof entry.query !== 'string') {
      continue;
    }

    const metrics = getQueryMetrics(entry.query, entry.operationName);
    if (!metrics) {
      continue;
    }

    if (metrics.maxDepth > MAX_QUERY_DEPTH) {
      res.status(400).json({
        errors: [
          {
            message: `Query depth ${metrics.maxDepth} exceeds maximum ${MAX_QUERY_DEPTH}`,
          },
        ],
      });
      return;
    }

    if (metrics.fieldCount > MAX_QUERY_FIELD_COUNT) {
      res.status(400).json({
        errors: [
          {
            message: `Query field count ${metrics.fieldCount} exceeds maximum ${MAX_QUERY_FIELD_COUNT}`,
          },
        ],
      });
      return;
    }
  }

  next();
}

const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: MAX_REQUESTS_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
});

const mutationRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: MAX_MUTATIONS_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isMutationRequest(req),
});

export const app = express();
// API is deployed behind a reverse proxy (e.g. Render), so trust one hop.
app.set('trust proxy', 1);

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

const httpServer = http.createServer(app);

const schema = createSchema(
  resolvers as Parameters<typeof createSchema>[0],
);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer(
  {
    schema,
    context: async (ctx) =>
      createWsContext({
        connectionParams: ctx.connectionParams,
        request: (ctx.extra as { request?: { headers?: Record<string, string | string[]> } })
          .request,
      }),
  },
  wsServer as unknown as Parameters<typeof useServer>[1],
);

const errorLoggingPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart() {
    return {
      async didEncounterErrors(requestContext) {
        const operationName = requestContext.request.operationName ?? undefined;
        const contextValue = requestContext.contextValue as Partial<GraphQLContext> | undefined;
        const userId = contextValue?.user?.id ?? null;

        for (const encounteredError of requestContext.errors) {
          logError({
            error: encounteredError,
            operationName,
            userId,
          });
        }
      },
    };
  },
};

const apolloServer = new ApolloServer({
  schema,
  introspection: env.GRAPHQL_INTROSPECTION,
  plugins:
    env.NODE_ENV === 'development'
      ? [errorLoggingPlugin, ApolloServerPluginLandingPageLocalDefault({ embed: true })]
      : [errorLoggingPlugin, ApolloServerPluginLandingPageDisabled()],
});

async function startServer(): Promise<void> {
  await apolloServer.start();

  app.use(generalRateLimiter);

  app.get('/health', async (_req, res) => {
    const databaseOk = await checkDatabaseHealth();
    const statusCode = databaseOk ? 200 : 503;

    res.status(statusCode).json({
      status: databaseOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: databaseOk,
    });
  });

  app.use(
    '/graphql',
    cors({ origin: env.CORS_ORIGINS }),
    express.json(),
    queryComplexityGuard,
    mutationRateLimiter,
    expressMiddleware(apolloServer, {
      context: async ({ req }) => createContext({ req }),
    }),
  );

  await initRealtime(supabaseAdmin);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 GraphQL API ready at http://localhost:${env.PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start GraphQL server', error);
  process.exit(1);
});

const shutdown = async (): Promise<void> => {
  await cleanupRealtime();
  await serverCleanup.dispose();
  await apolloServer.stop();
  httpServer.close(() => process.exit(0));
};

process.on('SIGINT', () => {
  void shutdown();
});
process.on('SIGTERM', () => {
  void shutdown();
});

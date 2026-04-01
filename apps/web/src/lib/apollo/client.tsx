'use client';

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { useMemo, type ReactNode } from 'react';
import { getBrowserSupabaseClient } from '@/lib/auth/supabase';

const httpUri = process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL ?? 'http://localhost:4000/graphql';

function normalizeWsUri(configuredWsUri: string | undefined, fallbackHttpUri: string): string {
  const source = configuredWsUri ?? fallbackHttpUri;

  try {
    const url = new URL(source);

    if (url.protocol === 'http:') {
      url.protocol = 'ws:';
    } else if (url.protocol === 'https:') {
      url.protocol = 'wss:';
    }

    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/graphql';
    }

    return url.toString();
  } catch {
    return 'ws://localhost:4000/graphql';
  }
}

const wsUri = normalizeWsUri(process.env.NEXT_PUBLIC_GRAPHQL_WS_URL, httpUri);

function makeLink(): ApolloLink {
  const supabase = getBrowserSupabaseClient();

  const httpLink = new HttpLink({
    uri: httpUri,
    fetchOptions: {
      cache: 'no-store',
    },
  });

  const authLink = setContext(async (_, previousContext) => {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;

    return {
      headers: {
        ...previousContext.headers,
        'apollo-require-preflight': 'true',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  });

  const httpAuthLink = authLink.concat(httpLink);

  if (typeof window === 'undefined') {
    return httpAuthLink;
  }

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsUri,
      retryAttempts: 30,
      shouldRetry: () => true,
      retryWait: async () => new Promise((resolve) => setTimeout(resolve, 2000)),
      connectionParams: async () => {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        return accessToken
          ? {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          : {};
      },
    }),
  );

  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      const isOperationDefinition =
        definition.kind === 'OperationDefinition';

      if (!isOperationDefinition) {
        return false;
      }

      return definition.operation === 'subscription';
    },
    wsLink,
    httpAuthLink,
  );
}

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: makeLink(),
    devtools: {
      enabled: process.env.NODE_ENV === 'development',
    },
  });
}

export function AppApolloProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => makeClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { createServerComponentClient } from '@/lib/auth/server';

const httpUri = process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL ?? 'http://localhost:4000/graphql';

export async function createServerApolloClient(accessToken?: string) {
  let token = accessToken;

  if (!token) {
    const supabase = await createServerComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    token = session?.access_token;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: httpUri,
      fetch,
      headers,
      fetchOptions: {
        cache: 'no-store',
      },
    }),
  });
}

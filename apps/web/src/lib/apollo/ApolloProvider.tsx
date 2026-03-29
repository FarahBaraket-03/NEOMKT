'use client';

import type { ReactNode } from 'react';
import { AppApolloProvider } from './client';

export default function ApolloProvider({ children }: { children: ReactNode }) {
  return <AppApolloProvider>{children}</AppApolloProvider>;
}

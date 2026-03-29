import type { Metadata } from 'next';
import './globals.css';
import ApolloProvider from '@/lib/apollo/ApolloProvider';
import { AuthProvider } from '@/lib/auth/AuthContext';
import RealtimeProvider from '@/components/realtime/RealtimeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import AppChrome from '@/components/layout/AppChrome';

export const metadata: Metadata = {
  title: {
    default: 'NEOMKT',
    template: '%s | NEOMKT',
  },
  description: 'Cyberpunk technology products catalog powered by GraphQL.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen" suppressHydrationWarning>
        {/* Adds dynamic Cyberpunk background elements */}
        <div className="fixed inset-0 z-[-1] bg-circuit opacity-40 pointer-events-none" />
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background/80 to-background" />

        <ApolloProvider>
          <AuthProvider>
            <ToastProvider>
              <RealtimeProvider>
                <AppChrome>{children}</AppChrome>
              </RealtimeProvider>
            </ToastProvider>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}

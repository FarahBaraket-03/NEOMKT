'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <PageContainer>
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 relative">
        <div className="mb-8 text-center">
          <h1 
            data-text="SYS_REG"
            className="font-orbitron font-black uppercase text-4xl md:text-5xl text-accent cyber-glitch text-shadow-neon mb-2"
          >
            SYS_REG
          </h1>
          <p className="font-mono text-sm tracking-widest text-mutedForeground uppercase">
            // INTIALIZE_NEW_OPERATIVE_PROFILE
            <span className="ml-1 inline-block animate-blink text-accent">_</span>
          </p>
        </div>
        
        <Card variant="terminal" className="w-full max-w-lg bg-black/60 backdrop-blur-md border-accent/30 shadow-[var(--box-shadow-neon-sm)]">
          <CardContent className="pt-8">
            <form
              className="space-y-6"
              onSubmit={async (event) => {
                event.preventDefault();
                setError(null);

                if (password !== confirmPassword) {
                  setError('Passwords do not match');
                  return;
                }

                setLoading(true);
                try {
                  const result = await register(email, username, password);
                  pushToast({
                    title: result.requiresEmailConfirmation
                      ? 'ACCOUNT CREATED // CONFIRM EMAIL'
                      : 'USER CREATED // ACCESS GRANTED',
                    description: result.requiresEmailConfirmation
                      ? 'Check your inbox and confirm your email before logging in.'
                      : 'You can now log in with your credentials.',
                    variant: 'success',
                  });
                  router.push('/auth/login');
                } catch (registerError) {
                  setError((registerError as Error).message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="space-y-4">
                <Input placeholder="OPERATIVE_ID (EMAIL)" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="font-jetbrains" />
                <Input placeholder="ALIAS (USERNAME)" value={username} onChange={(event) => setUsername(event.target.value)} className="font-jetbrains" />
                <Input
                  placeholder="SECURITY_KEY (PASSWORD)"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="font-jetbrains"
                />
                <Input
                  placeholder="VERIFY_KEY (CONFIRM PASSWORD)"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="font-jetbrains"
                />
              </div>
              {error ? <p className="text-destructive font-mono text-sm tracking-widest uppercase animate-pulse">! SYS_ERR: {error}</p> : null}
              <Button type="submit" variant="default" className="w-full" isLoading={loading}>
                INITIALIZE_ID
              </Button>
              
              <div className="text-center pt-4 border-t border-border/50">
                <p className="font-mono text-xs text-mutedForeground uppercase tracking-widest">
                  ALREADY_HAVE_CREDENTIALS?{' '}
                  <button 
                    type="button" 
                    onClick={() => router.push('/auth/login')} 
                    className="text-accent hover:text-accentSecondary transition-colors"
                  >
                    ESTABLISH_UPLINK
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

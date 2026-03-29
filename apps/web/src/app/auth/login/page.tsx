'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PageContainer from '@/components/layout/PageContainer';
import { getBrowserSupabaseClient } from '@/lib/auth/supabase';
import { useToast } from '@/components/ui/Toast';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const FAILED_ATTEMPTS_KEY = 'auth.login.failedAttempts';
const LOCKOUT_UNTIL_KEY = 'auth.login.lockoutUntil';

function formatRemainingTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resolvePostLoginRedirect(redirectedFrom: string | null): string {
  if (!redirectedFrom) {
    return '/products';
  }

  // Only allow internal absolute paths to avoid open redirects.
  if (!redirectedFrom.startsWith('/') || redirectedFrom.startsWith('//')) {
    return '/products';
  }

  // Avoid redirect loops back into auth routes.
  if (redirectedFrom.startsWith('/auth')) {
    return '/products';
  }

  return redirectedFrom;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const isLocked = lockoutUntil !== null && lockoutUntil > now;
  const remainingLockoutMs = isLocked && lockoutUntil ? lockoutUntil - now : 0;

  useEffect(() => {
    const storedAttempts = Number.parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) ?? '0', 10);
    const storedLockoutUntil = Number.parseInt(localStorage.getItem(LOCKOUT_UNTIL_KEY) ?? '0', 10);

    if (!Number.isNaN(storedAttempts) && storedAttempts > 0) {
      setFailedAttempts(storedAttempts);
    }

    if (!Number.isNaN(storedLockoutUntil) && storedLockoutUntil > Date.now()) {
      setLockoutUntil(storedLockoutUntil);
    } else {
      localStorage.removeItem(LOCKOUT_UNTIL_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isLocked]);

  useEffect(() => {
    if (lockoutUntil === null || lockoutUntil > now) {
      return;
    }

    setLockoutUntil(null);
    setFailedAttempts(0);
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  }, [lockoutUntil, now]);

  const persistFailedAttempts = (attempts: number) => {
    setFailedAttempts(attempts);
    localStorage.setItem(FAILED_ATTEMPTS_KEY, attempts.toString());
  };

  const resetLockoutState = () => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
  };

  return (
    <PageContainer>
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 relative">
        <div className="mb-8 text-center">
          <h1 
            data-text="SYS_AUTH"
            className="font-orbitron font-black uppercase text-4xl md:text-5xl text-accent cyber-glitch text-shadow-neon mb-2"
          >
            SYS_AUTH
          </h1>
          <p className="font-mono text-sm tracking-widest text-mutedForeground uppercase">
            // PROVIDE_CREDENTIALS_TO_ACCESS_MAINFRAME
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

                if (isLocked) {
                  return;
                }

                setLoading(true);

                try {
                  const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      email,
                      password,
                    }),
                  });

                  const payload = (await response.json().catch(() => ({}))) as {
                    accessToken?: string;
                    refreshToken?: string;
                    lockoutUntil?: number;
                  };

                  if (
                    !response.ok ||
                    !payload.accessToken ||
                    !payload.refreshToken
                  ) {
                    const nextAttempts = failedAttempts + 1;
                    persistFailedAttempts(nextAttempts);

                    if (
                      typeof payload.lockoutUntil === 'number' &&
                      payload.lockoutUntil > Date.now()
                    ) {
                      setLockoutUntil(payload.lockoutUntil);
                      localStorage.setItem(LOCKOUT_UNTIL_KEY, payload.lockoutUntil.toString());
                    } else if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
                      const nextLockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                      setLockoutUntil(nextLockoutUntil);
                      localStorage.setItem(LOCKOUT_UNTIL_KEY, nextLockoutUntil.toString());
                    }

                    setError('Authentication failed.');
                    return;
                  }

                  const supabase = getBrowserSupabaseClient();
                  const { error: sessionError } = await supabase.auth.setSession({
                    access_token: payload.accessToken,
                    refresh_token: payload.refreshToken,
                  });

                  if (sessionError) {
                    setError('Authentication failed.');
                    return;
                  }

                  resetLockoutState();
                  pushToast({
                    title: 'UPLINK ESTABLISHED',
                    description: 'Authentication successful. Redirecting to catalog feed.',
                    variant: 'success',
                  });
                  const redirectTarget = resolvePostLoginRedirect(searchParams.get('redirectedFrom'));
                  router.push(redirectTarget);
                } catch {
                  setError('Authentication failed.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="space-y-4">
                <Input
                  placeholder="OPERATIVE_ID (EMAIL)"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading || isLocked}
                />
                <Input
                  placeholder="PASSCODE"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading || isLocked}
                />
              </div>
              
              {error ? <p className="text-destructive font-mono text-sm tracking-widest uppercase animate-pulse">! SYS_ERR: {error}</p> : null}
              {isLocked ? (
                <p className="text-accent font-mono text-xs tracking-widest uppercase">
                  LOCKDOWN ACTIVE // RETRY IN {formatRemainingTime(remainingLockoutMs)}
                </p>
              ) : null}
              
              <Button
                type="submit"
                variant="default"
                className="w-full"
                isLoading={loading}
                disabled={isLocked}
              >
                {isLocked ? 'ACCESS_LOCKED' : 'ESTABLISH_UPLINK'}
              </Button>
              
              <div className="text-center pt-4 border-t border-border/50">
                <p className="font-mono text-xs text-mutedForeground uppercase tracking-widest">
                  NO_CREDENTIALS?{' '}
                  <button 
                    type="button" 
                    onClick={() => router.push('/auth/register')} 
                    disabled={loading || isLocked}
                    className="text-accent hover:text-accentSecondary transition-colors"
                  >
                    REQUEST_ACCESS
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

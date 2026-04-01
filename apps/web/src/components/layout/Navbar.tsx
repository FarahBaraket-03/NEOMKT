'use client';

import Link from 'next/link';
import { Menu, X, Home, Cpu, Database, LogOut, UserCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import PageContainer from './PageContainer';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth/AuthContext';
import Button from '@/components/ui/Button';

const links = [
  { href: '/', label: 'HOME', icon: Home, prefix: '' },
  { href: '/products', label: 'PRODUCTS', icon: null, prefix: '>_ ' },
  { href: '/brands', label: 'BRANDS', icon: Cpu, prefix: '' },
  { href: '/api-docs', label: 'API_DOCS', icon: Database, prefix: '' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const displayName = useMemo(() => {
    const fromMeta = user?.user_metadata?.username;
    if (typeof fromMeta === 'string' && fromMeta.trim().length > 0) {
      return fromMeta;
    }

    const email = user?.email ?? '';
    if (email.includes('@')) {
      return email.split('@')[0] ?? 'USER';
    }

    return 'USER';
  }, [user]);

  const avatarText = useMemo(() => {
    const normalized = displayName.trim();
    if (normalized.length === 0) {
      return 'U';
    }

    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
    }

    return normalized.slice(0, 2).toUpperCase();
  }, [displayName]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur-sm bg-background/80">
      <PageContainer>
        <div className="h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8">
              <Logo />
            </div>
            <span className="font-orbitron font-black text-white text-xl tracking-widest group-hover:text-shadow-neon transition-all">
              NEOMKT
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 font-mono uppercase tracking-widest text-sm transition-all duration-300 py-1.5 px-3',
                    isActive 
                      ? 'text-accent border border-accent shadow-[0_0_10px_rgba(0,255,136,0.3)] bg-accent/5' 
                      : 'text-mutedForeground hover:text-accent/80 border border-transparent hover:border-accent/30'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.prefix && <span className="opacity-70">{link.prefix}</span>}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {!isLoading && !user ? (
              <Link
                href="/auth/login"
                className={cn(
                  'flex items-center gap-2 font-mono uppercase tracking-widest text-sm transition-all duration-300 py-1.5 px-3',
                  pathname === '/auth/login'
                    ? 'text-accent border border-accent shadow-[0_0_10px_rgba(0,255,136,0.3)] bg-accent/5'
                    : 'text-mutedForeground hover:text-accent/80 border border-transparent hover:border-accent/30',
                )}
              >
                <UserCircle className="w-4 h-4" />
                <span>SYS_LOGIN</span>
              </Link>
            ) : null}

            {!isLoading && user ? (
              <div className="flex items-center gap-3 border border-border px-3 py-1.5 cyber-chamfer-sm bg-card/70">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/60 bg-accent/10 font-mono text-xs text-accent">
                  {avatarText}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/90">
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-[0.16em] text-mutedForeground hover:text-destructive transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            ) : null}
          </nav>

          <button
            type="button"
            className="md:hidden text-accent"
            onClick={() => setIsOpen((current) => !current)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </PageContainer>

      {isOpen ? (
        <div className="md:hidden fixed inset-0 bg-background z-40 overflow-y-auto pb-8">
          <PageContainer>
            <div className="pt-24 flex flex-col gap-2">
              {!isLoading && user ? (
                <div className="border border-border cyber-chamfer-sm bg-card/60 px-4 py-3 flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 bg-accent/10 font-mono text-sm text-accent">
                      {avatarText}
                    </span>
                    <span className="font-mono uppercase tracking-[0.16em] text-sm text-foreground">
                      {displayName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void handleLogout();
                    }}
                    className="text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : null}

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'font-jetbrains uppercase tracking-widest text-xl py-4 w-full text-center border-b border-border/50 hover:bg-white/5 active:bg-white/10 transition-colors',
                    pathname === link.href ? 'text-accent border-b-accent/50' : 'text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {!isLoading && !user ? (
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'font-jetbrains uppercase tracking-widest text-xl py-4 w-full text-center border-b border-border/50 hover:bg-white/5 active:bg-white/10 transition-colors',
                    pathname === '/auth/login' ? 'text-accent border-b-accent/50' : 'text-foreground',
                  )}
                >
                  SYS_LOGIN
                </Link>
              ) : null}
            </div>
          </PageContainer>
        </div>
      ) : null}
    </header>
  );
}

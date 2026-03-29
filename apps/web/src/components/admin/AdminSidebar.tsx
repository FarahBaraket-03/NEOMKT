'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState, type ComponentType } from 'react';
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Tag,
  X,
} from 'lucide-react';
import { getBrowserSupabaseClient } from '@/lib/auth/supabase';
import { cn } from '@/lib/utils';

interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
}

const adminItems: AdminNavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    match: (pathname) => pathname === '/admin',
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
    match: (pathname) => pathname.startsWith('/admin/products'),
  },
  {
    label: 'Brands',
    href: '/admin/brands',
    icon: Tag,
    match: (pathname) => pathname.startsWith('/admin/brands'),
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
    match: (pathname) => pathname.startsWith('/admin/categories'),
  },
  {
    label: 'Reviews',
    href: '/admin/reviews',
    icon: MessageSquare,
    match: (pathname) => pathname.startsWith('/admin/reviews'),
  },
];

function AdminNavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {adminItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.match(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-4 py-3 border-l-2 transition-colors',
              'font-jetbrains uppercase tracking-widest text-xs',
              isActive
                ? 'bg-muted border-l-accent text-accent'
                : 'border-l-transparent text-mutedForeground hover:text-accent hover:bg-muted/50',
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <Link
        href="/"
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 px-4 py-3 border-l-2 border-l-transparent transition-colors',
          'font-jetbrains uppercase tracking-widest text-xs',
          'text-mutedForeground hover:text-accent hover:bg-muted/50',
        )}
      >
        <ExternalLink className="h-4 w-4" />
        <span>Back to Site</span>
      </Link>
    </nav>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const supabase = useMemo(() => getBrowserSupabaseClient(), []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] bg-card border-r border-border flex-col z-30">
        <div className="px-5 py-6 border-b border-border">
          <Link
            href="/admin"
            className="font-orbitron text-accent uppercase tracking-wider text-base"
          >
            {'> ADMIN//PANEL'}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <AdminNavLinks pathname={pathname} />
        </div>

        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 border border-border cyber-chamfer-sm',
              'font-jetbrains uppercase tracking-widest text-xs',
              'text-mutedForeground hover:text-accent hover:border-accent hover:bg-muted/50',
            )}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-30 bg-card border-b border-border">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link href="/admin" className="font-orbitron text-accent uppercase tracking-wider text-sm">
            {'> ADMIN//PANEL'}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="h-9 w-9 inline-flex items-center justify-center border border-border cyber-chamfer-sm text-mutedForeground hover:text-accent hover:border-accent"
            aria-label="Toggle admin menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="lg:hidden fixed inset-0 bg-background/80 z-30"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-14 bottom-0 w-[240px] bg-card border-r border-border z-40 flex flex-col">
            <div className="flex-1 overflow-y-auto py-4">
              <AdminNavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={async () => {
                  setMobileOpen(false);
                  await handleLogout();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 border border-border cyber-chamfer-sm',
                  'font-jetbrains uppercase tracking-widest text-xs',
                  'text-mutedForeground hover:text-accent hover:border-accent hover:bg-muted/50',
                )}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

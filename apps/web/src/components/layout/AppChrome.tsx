'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col relative z-0">
      {!isAdminRoute ? <Navbar /> : null}
      <main className="flex-1">{children}</main>
      {!isAdminRoute ? <Footer /> : null}
    </div>
  );
}

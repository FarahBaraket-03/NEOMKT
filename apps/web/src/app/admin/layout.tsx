import type { ReactNode } from 'react';
import { ensureAdminAccess } from '@/lib/auth/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await ensureAdminAccess();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-[240px] min-h-screen">
        <div className="px-4 py-4 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
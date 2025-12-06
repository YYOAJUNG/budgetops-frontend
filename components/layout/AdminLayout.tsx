'use client';

import { useEffect } from 'react';
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute';
import { AdminTopbar } from './AdminTopbar';
import { useUIStore } from '@/store/ui';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { setAdminMode } = useUIStore();

  // 관리자 페이지 접근 시 adminMode 활성화
  useEffect(() => {
    setAdminMode(true);
  }, [setAdminMode]);

  return (
    <AdminProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden flex-col">
        <AdminTopbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </AdminProtectedRoute>
  );
}


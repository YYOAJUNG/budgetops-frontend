'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  showTopbar?: boolean;
}

const TRANSITION_CLASS = 'transition-all duration-500 ease-in-out';

export function MainLayout({ children, showTopbar = true }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { aiChatOpen, adminMode } = useUIStore();

  // 관리자 모드일 때 관리자 페이지로 리다이렉트 (관리자 페이지가 아닌 경우)
  useEffect(() => {
    if (adminMode && !pathname?.startsWith('/admin')) {
      router.replace('/admin/users');
    }
  }, [adminMode, pathname, router]);

  // 관리자 모드일 때는 MainLayout을 렌더링하지 않음 (AdminLayout 사용)
  if (adminMode) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className={cn('fixed inset-y-0 left-0 z-50', TRANSITION_CLASS)}>
          <Sidebar />
        </div>

        <div className={cn(
          'flex-1 flex flex-col overflow-hidden',
          'md:ml-16 ml-0',
          TRANSITION_CLASS,
          aiChatOpen ? 'md:mr-[480px] mr-0' : 'mr-0'
        )}>
          {showTopbar && <Topbar />}
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
            {children}
          </main>
        </div>

        <AIChatPanel />
      </div>
    </ProtectedRoute>
  );
}

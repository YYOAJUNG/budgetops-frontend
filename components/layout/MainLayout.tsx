'use client';

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
  const { aiChatOpen } = useUIStore();

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className={cn('fixed inset-y-0 left-0 z-50', TRANSITION_CLASS)}>
          <Sidebar />
        </div>

        <div className={cn(
          'flex-1 flex flex-col overflow-hidden ml-64',
          TRANSITION_CLASS,
          aiChatOpen ? 'mr-96' : 'mr-0'
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

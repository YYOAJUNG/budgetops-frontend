'use client';

import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { useDragToToggleSidebar } from '@/hooks/useDragToToggleSidebar';
import { UI_CONFIG } from '@/constants/ui';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const { handleDragStart } = useDragToToggleSidebar({
    direction: 'right',
    onToggle: (shouldOpen) => setSidebarOpen(shouldOpen),
  });

  // 화면 크기에 따라 초기 사이드바 상태 설정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < UI_CONFIG.SIDEBAR.MOBILE_BREAKPOINT) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // 초기 실행
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - 데스크톱에서도 fixed */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar />
        </div>

        {/* Desktop: Drag Handle (사이드바가 닫혔을 때) */}
        {!sidebarOpen && (
          <div
            className="hidden lg:block fixed left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-blue-500 transition-colors group z-30"
            onMouseDown={handleDragStart}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 group-hover:bg-blue-500 transition-colors rounded-r" />
          </div>
        )}

        {/* Main Content - 사이드바 너비만큼 왼쪽 여백 */}
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
            // 데스크톱에서 사이드바 열림/닫힘에 따라 전체 레이아웃 조정
            sidebarOpen ? "lg:ml-64" : "lg:ml-0"
          )}
        >
          <Topbar />
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

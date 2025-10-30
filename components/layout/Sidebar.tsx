'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Target,
  Cloud,
  Lightbulb,
  Calculator,
  FileText,
  Bot,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Settings as SettingsIcon
} from 'lucide-react';
import { Grid, DollarSquare, User, Sparkles, InboxArchive } from '@mynaui/icons-react';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: Grid },
  { name: '리소스 관리', href: '/accounts', icon: Cloud },
  { name: '비용 분석', href: '/costs', icon: DollarSquare },
  { name: 'AI 어시스턴트', href: '/copilot', icon: Sparkles },
  {
    name: '마이 페이지',
    href: '/mypage',
    icon: User,
    children: [
      { name: '내 정보', href: '/mypage#info' },
      { name: '클라우드 계정 연동', href: '/mypage#accounts' },
      { name: '구독 및 결제', href: '/mypage#subscription' },
      { name: '설정', href: '/mypage#settings' },
    ]
  },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Simulators', href: '/simulators/db-billing', icon: Calculator },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { setSidebarOpen } = useUIStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const handleLinkClick = () => {
    // 모바일에서 링크 클릭 시 사이드바 닫기
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // 드래그 핸들러
  const handleDragStart = (e: React.MouseEvent) => {
    if (window.innerWidth < 1024) return; // 모바일에서는 드래그 비활성화
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX.current;

      // 드래그 거리가 50px 이상이면 토글
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) {
          // 왼쪽으로 드래그 -> 닫기
          setSidebarOpen(false);
        }
        setIsDragging(false);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, setSidebarOpen]);

  return (
    <div ref={sidebarRef} className="relative flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold text-gray-900">BudgetOps</h1>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex-1 flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group',
                      pathname?.startsWith('/mypage')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className={cn(
                      'mr-3 h-5 w-5 transition-colors',
                      pathname?.startsWith('/mypage') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )} />
                    {item.name}
                  </Link>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {expandedMenus.includes(item.name) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {expandedMenus.includes(item.name) && (
                  <div className="space-y-1 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-3 py-2 text-sm rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        onClick={(e) => {
                          // 같은 페이지 내 앵커로 스크롤
                          if (pathname === '/mypage' && child.href.includes('#')) {
                            e.preventDefault();
                            const id = child.href.split('#')[1];
                            const element = document.getElementById(id);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                )} />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <a
          href="https://forms.google.com/your-form-url"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
        >
          <InboxArchive className="mr-3 h-5 w-5 text-blue-600" />
          피드백 남기기
        </a>
      </div>

      {/* Drag Handle - 데스크톱에서만 표시 */}
      <div
        className="hidden lg:block absolute right-0 top-0 h-full w-1 cursor-ew-resize hover:bg-blue-500 transition-colors group"
        onMouseDown={handleDragStart}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 group-hover:bg-blue-500 transition-colors rounded-l" />
      </div>
    </div>
  );
}

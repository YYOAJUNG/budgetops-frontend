'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import { NAVIGATION_ITEMS, FEEDBACK_LINK } from '@/constants/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { InboxArchive } from '@mynaui/icons-react';

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarCollapsed(false);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 200);
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col bg-white border-r border-gray-200 shadow-sm overflow-hidden",
        "transition-[width] duration-500 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/" className="flex items-center overflow-hidden">
          <h1 className={cn(
            "text-xl font-bold text-gray-900 whitespace-nowrap",
            "transition-[opacity,transform] duration-300 ease-in-out",
            sidebarCollapsed ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0 delay-100"
          )}>
            BudgetOps
          </h1>
          <span className={cn(
            "text-sm font-bold text-gray-900 absolute left-6",
            "transition-[opacity,transform] duration-300 ease-in-out",
            sidebarCollapsed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          )}>
            BO
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAVIGATION_ITEMS.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={cn(
                      'flex-1 flex items-center px-3 py-2.5 text-sm rounded-lg overflow-hidden',
                      'transition-[background-color,color] duration-200 group relative',
                      pathname?.startsWith('/mypage')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                      sidebarCollapsed && 'justify-center'
                    )}
                  >
                    <item.icon className={cn(
                      'h-5 w-5 shrink-0 transition-colors duration-200',
                      sidebarCollapsed ? '' : 'mr-3',
                      pathname?.startsWith('/mypage') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )} />
                    {!sidebarCollapsed && (
                      <span className="whitespace-nowrap transition-opacity duration-300 ease-in-out delay-75">
                        {item.name}
                      </span>
                    )}
                  </Link>
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className="p-2 hover:bg-gray-50 rounded-lg shrink-0 transition-[background-color] duration-200"
                    >
                      {expandedMenus.includes(item.name) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
                {!sidebarCollapsed && expandedMenus.includes(item.name) && (
                  <div className="space-y-1 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-3 py-2 text-sm rounded-lg whitespace-nowrap overflow-hidden transition-[background-color,color] duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                title={sidebarCollapsed ? item.name : undefined}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm rounded-lg overflow-hidden',
                  'transition-[background-color,color] duration-200 group relative',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors duration-200',
                  sidebarCollapsed ? '' : 'mr-3',
                  pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                )} />
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap transition-opacity duration-300 ease-in-out delay-75">
                    {item.name}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <a
          href={FEEDBACK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          title={sidebarCollapsed ? "피드백 남기기" : undefined}
          className={cn(
            "flex items-center px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg overflow-hidden transition-[background-color] duration-200",
            sidebarCollapsed && "justify-center"
          )}
        >
          <InboxArchive className={cn(
            "h-5 w-5 shrink-0 text-blue-600 transition-all duration-200",
            sidebarCollapsed ? '' : 'mr-3'
          )} />
          {!sidebarCollapsed && (
            <span className="whitespace-nowrap transition-opacity duration-300 ease-in-out delay-75">
              피드백 남기기
            </span>
          )}
        </a>
      </div>
    </div>
  );
}

'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { UserMenu } from './UserMenu';
import { NotificationMenu, type Notification } from './NotificationMenu';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useNotificationsStore } from '@/store/notifications';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api/notifications';
import { Users, CreditCard, ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOPBAR_BASE = 'flex h-16 items-center justify-between border-b border-slate-700 bg-slate-900 text-white px-4 md:px-6 shadow-lg';

export function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { setAdminMode } = useUIStore();
  const {
    notifications,
    setNotifications,
    markAllRead,
    markReadById,
    unreadCount,
    loadFromStorage,
  } = useNotificationsStore();

  useEffect(() => {
    loadFromStorage();
    fetchNotifications().then(items => {
      setNotifications(items);
    });
  }, [loadFromStorage, setNotifications]);

  const handleNotificationClick = (id: string) => {
    markReadById(id);
    void markNotificationRead(id);
  };

  const handleViewAll = () => {
    window.location.href = '/notifications';
  };

  const handleMarkAllRead = () => {
    markAllRead();
    void markAllNotificationsRead();
  };

  const handleExitAdminMode = () => {
    setAdminMode(false);
    router.push('/dashboard');
  };

  const unread = unreadCount();

  const navItems = [
    { href: '/admin/users', label: '사용자 관리', icon: Users },
    { href: '/admin/payments', label: '결제 내역', icon: CreditCard },
    { href: '/admin/feedback', label: '피드백', icon: MessageSquare },
  ];

  return (
    <div className={TOPBAR_BASE}>
      {/* 좌측: 로고 + 탭 메뉴 */}
      <div className="flex items-center gap-6">
        <Link href="/admin/users" className="flex items-center">
          <h1 className="text-xl font-bold text-white">BudgetOps</h1>
          <span className="ml-2 text-xs text-slate-300 bg-blue-600/30 border border-blue-500/40 text-white px-2 py-1 rounded">
            관리자
          </span>
        </Link>

        {/* 탭 메뉴 */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 우측: 일반 모드 전환 버튼 + 알림 + 사용자 메뉴 */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitAdminMode}
          className="bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          일반 모드 전환
        </Button>
        <UserMenu user={user} adminMode={true} />
      </div>
    </div>
  );
}


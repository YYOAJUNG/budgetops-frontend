'use client';

import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { UserMenu } from './UserMenu';
import { NotificationMenu, type Notification } from './NotificationMenu';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEffect } from 'react';
import { useNotificationsStore } from '@/store/notifications';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api/notifications';

// 모바일 반응형 관련 상수
const MOBILE_MENU_BUTTON = 'md:hidden p-2 rounded-lg transition-all hover:bg-gray-100';
const TOPBAR_BASE = 'flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-4 md:px-6 shadow-sm';
const AI_CHAT_BUTTON = 'p-2 rounded-lg transition-all hover:bg-indigo-50 hover:shadow-sm group relative';

export function Topbar() {
  const { user } = useAuthStore();
  const { toggleAIChat, aiChatOpen, toggleMobileSidebar } = useUIStore();
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
    // 초기 로드: 서버(또는 목)에서 가져오기
    fetchNotifications().then(items => {
      // ISO timestamp를 상대 표기로 바꾸고 싶다면 UI에서 처리 가능
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

  const unread = unreadCount();

  return (
    <div className={TOPBAR_BASE}>
      {/* Mobile Hamburger Menu */}
      <button
        onClick={toggleMobileSidebar}
        className={MOBILE_MENU_BUTTON}
        aria-label="메뉴 열기"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Spacer to push icons to the right */}
      <div className="flex-1" />

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAIChat}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative group"
          aria-label="AI 어시스턴트"
        >
          <Image
            src="/ai-chat-icon.png"
            alt="AI 어시스턴트"
            width={22}
            height={22}
            className="h-5.5 w-5.5 group-hover:scale-110 transition-transform -mt-1"
          />
          {!aiChatOpen && unread > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
          )}
        </Button>
        <NotificationMenu
          notifications={notifications as Notification[]}
          unreadCount={unread}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
          onViewAll={handleViewAll}
        />
        <UserMenu user={user} />
      </div>
    </div>
  );
}

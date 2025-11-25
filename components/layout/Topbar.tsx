'use client';

import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { UserMenu } from './UserMenu';
import { NotificationMenu, type Notification } from './NotificationMenu';
import { MessageCircle, Menu } from 'lucide-react';
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

      {/* Spacer for mobile, hidden on desktop */}
      <div className="flex-1 md:hidden" />

      <div className="flex items-center space-x-2 md:ml-auto">
        <button
          onClick={toggleAIChat}
          className={AI_CHAT_BUTTON}
          aria-label="AI 어시스턴트"
        >
          <MessageCircle className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
          {!aiChatOpen && unread > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          )}
        </button>
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

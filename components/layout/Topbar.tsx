'use client';

import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { UserMenu } from './UserMenu';
import { NotificationMenu, type Notification } from './NotificationMenu';
import { MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useNotificationsStore } from '@/store/notifications';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api/notifications';

export function Topbar() {
  const { user } = useAuthStore();
  const { toggleAIChat, aiChatOpen } = useUIStore();
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
    console.log('View all notifications');
  };

  const handleMarkAllRead = () => {
    markAllRead();
    void markAllNotificationsRead();
  };

  const unread = unreadCount();

  return (
    <div className="flex h-16 items-center justify-end border-b border-slate-200 bg-white/95 backdrop-blur px-6 shadow-sm">
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleAIChat}
          className="p-2 rounded-lg transition-all hover:bg-indigo-50 hover:shadow-sm group relative"
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

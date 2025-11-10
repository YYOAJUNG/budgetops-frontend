'use client';

import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { UserMenu } from './UserMenu';
import { NotificationMenu, type Notification } from './NotificationMenu';
import { Sparkles } from '@mynaui/icons-react';

// TODO: Replace with API call
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: '비용 알림',
    message: 'AWS 계정의 이번 달 비용이 예산의 80%를 초과했습니다.',
    timestamp: '5분 전',
    isRead: false,
  },
  {
    id: '2',
    title: '계정 연동 완료',
    message: 'GCP 계정이 성공적으로 연동되었습니다.',
    timestamp: '1시간 전',
    isRead: true,
  },
  {
    id: '3',
    title: '비용 최적화 제안',
    message: '사용하지 않는 EC2 인스턴스 3개를 발견했습니다.',
    timestamp: '2시간 전',
    isRead: true,
  },
];

export function Topbar() {
  const { user } = useAuthStore();
  const { toggleAIChat, aiChatOpen } = useUIStore();

  // TODO: Replace with actual API calls
  const handleMarkAllRead = () => {
    console.log('Mark all notifications as read');
  };

  const handleNotificationClick = (id: string) => {
    console.log('Notification clicked:', id);
  };

  const handleViewAll = () => {
    console.log('View all notifications');
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <div className="flex h-16 items-center justify-end border-b border-slate-200 bg-white/95 backdrop-blur px-6 shadow-sm">
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleAIChat}
          className="p-2 rounded-lg transition-all hover:bg-indigo-50 hover:shadow-sm group relative"
          aria-label="AI 어시스턴트"
        >
          <Sparkles className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
          {!aiChatOpen && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          )}
        </button>
        <NotificationMenu
          notifications={MOCK_NOTIFICATIONS}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
          onViewAll={handleViewAll}
        />
        <UserMenu user={user} />
      </div>
    </div>
  );
}

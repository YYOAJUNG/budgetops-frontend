'use client';

import { useContextStore } from '@/store/context';
import { useAuthStore } from '@/store/auth';
import { useTenants } from '@/lib/api/queries';
import { TenantSwitcher } from './TenantSwitcher';
import { DateRangePicker } from './DateRangePicker';
import { CurrencySelect } from './CurrencySelect';
import { UserMenu } from './UserMenu';
import { NotificationMenu, type Notification } from './NotificationMenu';
import { Button } from '@/components/ui/button';

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
  const { tenantId, currency } = useContextStore();
  const { user } = useAuthStore();
  const { data: tenants } = useTenants();

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
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <TenantSwitcher tenants={tenants || []} />
        <DateRangePicker />
        <CurrencySelect />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          + 클라우드 계정 연동
        </Button>
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

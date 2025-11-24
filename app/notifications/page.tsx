'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotificationsStore } from '@/store/notifications';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api/notifications';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const {
    notifications,
    setNotifications,
    markAllRead,
    markReadById,
    unreadCount,
  } = useNotificationsStore();

  useEffect(() => {
    // 페이지 로드 시 최신 알림 가져오기
    fetchNotifications().then(items => {
      setNotifications(items);
    });
  }, [setNotifications]);

  const handleMarkAllRead = async () => {
    markAllRead();
    await markAllNotificationsRead();
  };

  const handleMarkRead = async (id: string) => {
    markReadById(id);
    await markNotificationRead(id);
  };

  const unread = unreadCount();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">알림</h1>
            <p className="mt-1 text-sm text-slate-600">
              AWS EC2 리소스 임계치 초과 알림을 확인하세요.
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              모두 읽음 표시
            </Button>
          )}
        </div>

        {/* 알림 목록 */}
        {notifications.length === 0 ? (
          <Card className="border-2 border-slate-200">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-slate-100 p-4">
                  <Bell className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    알림이 없습니다
                  </h3>
                  <p className="text-sm text-slate-600">
                    AWS EC2 리소스 임계치 초과 시 알림이 표시됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const importanceColor = 
                notification.importance === 'high' 
                  ? 'border-l-4 border-l-red-500 bg-red-50/50'
                  : notification.importance === 'normal'
                  ? 'border-l-4 border-l-yellow-500 bg-yellow-50/50'
                  : 'border-l-4 border-l-blue-500 bg-blue-50/50';

              return (
                <Card
                  key={notification.id}
                  className={`${importanceColor} ${!notification.isRead ? 'shadow-md' : 'opacity-75'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {notification.provider && (
                            <Badge 
                              className={
                                notification.provider === 'AWS' 
                                  ? 'bg-orange-500 text-white'
                                  : notification.provider === 'GCP'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-sky-500 text-white'
                              }
                            >
                              {notification.provider}
                            </Badge>
                          )}
                          {notification.service && (
                            <Badge variant="secondary">
                              {notification.service}
                            </Badge>
                          )}
                          {notification.importance === 'high' && (
                            <Badge className="bg-red-600 text-white">
                              긴급
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <Badge className="bg-blue-600 text-white">
                              새 알림
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                          {notification.title}
                        </CardTitle>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkRead(notification.id)}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          읽음
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 mb-3">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(notification.timestamp).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}


'use client';

import { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotificationsStore } from '@/store/notifications';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api/notifications';
import { Check, CheckCheck, Bell } from 'lucide-react';

type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'NCP';

export default function NotificationsPage() {
  const {
    notifications,
    setNotifications,
    markAllRead,
    markReadById,
    unreadCount,
  } = useNotificationsStore();

  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | 'ALL'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 최신 알림 가져오기
    fetchNotifications().then(items => {
      setNotifications(items);
    });
  }, [setNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const items = await fetchNotifications();
      setNotifications(items);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProviderClick = async (provider: CloudProvider | 'ALL') => {
    setSelectedProvider(provider);
    // CSP 선택 시 최신 알림 가져오기
    await handleRefresh();
  };

  const handleMarkAllRead = async () => {
    markAllRead();
    await markAllNotificationsRead();
  };

  const handleMarkRead = async (id: string) => {
    markReadById(id);
    await markNotificationRead(id);
  };

  // 필터링된 알림
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // CSP 필터
    if (selectedProvider !== 'ALL') {
      filtered = filtered.filter(n => n.provider === selectedProvider);
    }
    
    return filtered;
  }, [notifications, selectedProvider]);

  const unread = unreadCount();
  const availableProviders: CloudProvider[] = ['AWS', 'GCP', 'Azure', 'NCP'];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">알림</h1>
          <p className="mt-1 text-sm text-slate-600">
            클라우드 리소스 임계치 초과 알림을 확인하고 관리하세요.
          </p>
        </div>

        {/* CSP 필터 및 액션 바 */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* CSP 버튼 그룹 */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={selectedProvider === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleProviderClick('ALL')}
                  disabled={isRefreshing}
                  className="font-medium"
                >
                  전체
                </Button>
                <Button
                  variant={selectedProvider === 'AWS' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleProviderClick('AWS')}
                  disabled={isRefreshing}
                  className={selectedProvider === 'AWS' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}
                >
                  AWS
                </Button>
                <Button
                  variant={selectedProvider === 'GCP' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleProviderClick('GCP')}
                  disabled={isRefreshing}
                  className={selectedProvider === 'GCP' ? 'bg-blue-500 hover:bg-blue-600' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}
                >
                  GCP
                </Button>
                <Button
                  variant={selectedProvider === 'Azure' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleProviderClick('Azure')}
                  disabled={isRefreshing}
                  className={selectedProvider === 'Azure' ? 'bg-sky-500 hover:bg-sky-600' : 'border-sky-300 text-sky-700 hover:bg-sky-50'}
                >
                  Azure
                </Button>
                <Button
                  variant={selectedProvider === 'NCP' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleProviderClick('NCP')}
                  disabled={isRefreshing}
                  className={selectedProvider === 'NCP' ? 'bg-green-500 hover:bg-green-600' : 'border-green-300 text-green-700 hover:bg-green-50'}
                >
                  NCP
                </Button>
              </div>

              {/* 우측 액션 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {filteredNotifications.length}개의 알림
                </span>
                {unread > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="gap-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                    모두 읽음
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 알림 목록 */}
        {filteredNotifications.length === 0 ? (
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
            {filteredNotifications.map((notification) => {
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
                                  : notification.provider === 'NCP'
                                  ? 'bg-green-500 text-white'
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


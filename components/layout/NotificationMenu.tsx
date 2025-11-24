'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from '@mynaui/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  importance?: 'low' | 'normal' | 'high';
  service?: string;
  provider?: 'AWS' | 'GCP' | 'Azure';
}

interface NotificationMenuProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead?: () => void;
  onNotificationClick?: (id: string) => void;
  onViewAll?: () => void;
}

export function NotificationMenu({
  notifications,
  unreadCount,
  onMarkAllRead,
  onNotificationClick,
  onViewAll,
}: NotificationMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white border border-gray-200 shadow-lg rounded-lg" align="end">
        <DropdownMenuLabel className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">알림</span>
            {unreadCount > 0 && (
              <span
                onClick={onMarkAllRead}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                모두 읽음
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100" />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              알림이 없습니다
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                {index > 0 && <DropdownMenuSeparator className="bg-gray-50" />}
                <DropdownMenuItem
                  onClick={() => onNotificationClick?.(notification.id)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col items-start"
                >
                  <div className="flex items-start w-full gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {notification.provider && (
                          <Badge 
                            className={
                              notification.provider === 'AWS' 
                                ? 'bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5'
                                : notification.provider === 'GCP'
                                ? 'bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5'
                                : 'bg-sky-100 text-sky-700 text-xs px-1.5 py-0.5'
                            }
                          >
                            {notification.provider}
                          </Badge>
                        )}
                        {notification.service && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {notification.service}
                          </Badge>
                        )}
                        {notification.importance === 'high' && (
                          <Badge className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5">
                            긴급
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </DropdownMenuItem>
              </div>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem
          onClick={onViewAll}
          className="px-4 py-2 text-center text-sm text-blue-600 hover:bg-gray-50 cursor-pointer"
        >
          모든 알림 보기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

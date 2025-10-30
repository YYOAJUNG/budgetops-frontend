'use client';

import { Button } from '@/components/ui/button';
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
                  <div className="flex items-start w-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
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

'use client';

import { useContextStore } from '@/store/context';
import { useAuthStore } from '@/store/auth';
import { useTenants } from '@/lib/api/queries';
import { TenantSwitcher } from './TenantSwitcher';
import { DateRangePicker } from './DateRangePicker';
import { CurrencySelect } from './CurrencySelect';
import { UserMenu } from './UserMenu';
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

export function Topbar() {
  const { tenantId, currency } = useContextStore();
  const { user } = useAuthStore();
  const { data: tenants } = useTenants();

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-white border border-gray-200 shadow-lg rounded-lg" align="end">
            <DropdownMenuLabel className="px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">알림</span>
                <span className="text-xs text-blue-600 hover:underline cursor-pointer">모두 읽음</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-100" />
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col items-start">
                <div className="flex items-start w-full">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">비용 알림</p>
                    <p className="text-xs text-gray-600 mt-1">AWS 계정의 이번 달 비용이 예산의 80%를 초과했습니다.</p>
                    <p className="text-xs text-gray-400 mt-1">5분 전</p>
                  </div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-50" />
              <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col items-start">
                <div className="flex items-start w-full">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">계정 연동 완료</p>
                    <p className="text-xs text-gray-600 mt-1">GCP 계정이 성공적으로 연동되었습니다.</p>
                    <p className="text-xs text-gray-400 mt-1">1시간 전</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-50" />
              <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col items-start">
                <div className="flex items-start w-full">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">비용 최적화 제안</p>
                    <p className="text-xs text-gray-600 mt-1">사용하지 않는 EC2 인스턴스 3개를 발견했습니다.</p>
                    <p className="text-xs text-gray-400 mt-1">2시간 전</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem className="px-4 py-2 text-center text-sm text-blue-600 hover:bg-gray-50 cursor-pointer">
              모든 알림 보기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserMenu user={user} />
      </div>
    </div>
  );
}

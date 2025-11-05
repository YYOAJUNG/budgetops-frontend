'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, CreditCard, Cloud } from 'lucide-react';
import type { User as UserType } from '@/store/auth';
import { useUIStore } from '@/store/ui';

interface UserMenuProps {
  user: UserType | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const setTargetSection = useUIStore((s) => s.setTargetSection);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <Button variant="ghost" onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
        로그인
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-12 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            aria-label="마이 페이지로 이동"
            onClick={() => router.push('/mypage')}
          >
            <div className="flex h-9 w-12 items-center justify-center rounded-lg bg-[#eef2f9] text-slate-600 border border-slate-200 hover:bg-[#e2e8f0] transition-all duration-200">
              <User className="h-4 w-8" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg" align="end" sideOffset={8}>
          {user && (
            <>
              <DropdownMenuLabel className="font-normal px-4 pt-3 pb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-gray-900">{user.name}</p>
                  <p className="text-xs leading-none text-gray-500 mt-1">{user.email}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600">요금제</p>
                    <p className="text-sm font-medium text-blue-600 mt-1">프리미엄 플랜</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
            </>
          )}
          <DropdownMenuItem
            onClick={() => router.push('/mypage')}
            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
          >
            <User className="mr-3 h-4 w-4 text-gray-500" />
            <span>내 정보</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => { setTargetSection('accounts'); router.push('/mypage'); }}
            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
          >
            <Cloud className="mr-3 h-4 w-4 text-gray-500" />
            <span>클라우드 계정 연동</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push('/billing')}
            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
          >
            <CreditCard className="mr-3 h-4 w-4 text-gray-500" />
            <span>구독 및 결제</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push('/settings')}
            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
          >
            <Settings className="mr-3 h-4 w-4 text-gray-500" />
            <span>설정</span>
          </DropdownMenuItem>
          {user && (
            <>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4 text-red-500" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}

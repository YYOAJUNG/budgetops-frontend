'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';
import type { User as UserType } from '@/store/auth';

interface UserMenuProps {
  user: UserType | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <Button variant="ghost" onClick={() => router.push('/login')} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
        로그인
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <User className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal px-3 py-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-gray-900">{user.name}</p>
            <p className="text-xs leading-none text-gray-500">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem 
          onClick={() => router.push('/profile')}
          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4 text-gray-500" />
          <span>프로필</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push('/settings')}
          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4 text-gray-500" />
          <span>설정</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4 text-red-500" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

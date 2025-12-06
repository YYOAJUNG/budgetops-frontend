'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    const verifyAuth = async () => {
      await checkAuth();
      setHasCheckedAuth(true);
    };

    if (!hasCheckedAuth) {
      verifyAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  useEffect(() => {
    // 인증 확인이 완료된 후 관리자 권한 체크
    if (hasCheckedAuth && !isLoading) {
      if (!isAuthenticated) {
        router.replace('/');
        return;
      }
      
      // 관리자 권한 체크
      if (user?.role !== 'admin') {
        // 403 에러 또는 권한 없음 - 대시보드로 리다이렉트
        alert('관리자 권한이 필요합니다.');
        router.replace('/dashboard');
      }
    }
  }, [hasCheckedAuth, isAuthenticated, isLoading, user, router]);

  // 인증 확인 중이거나 로딩 중
  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>권한 확인 중...</span>
        </div>
      </div>
    );
  }

  // 관리자 권한이 없는 경우
  if (isAuthenticated && user?.role !== 'admin') {
    return null; // 리다이렉트 중
  }

  // 관리자 권한이 있는 경우
  return <>{children}</>;
}


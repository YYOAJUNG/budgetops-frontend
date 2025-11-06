'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
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
    // 인증 확인이 완료된 후 로그인하지 않은 경우 홈으로 리다이렉트
    if (hasCheckedAuth && !isAuthenticated && !isLoading) {
      router.replace('/');
    }
  }, [hasCheckedAuth, isAuthenticated, isLoading, router]);

  // 인증 확인 중이거나 로그인하지 않은 경우 로딩 표시
  if (!hasCheckedAuth || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>로그인 확인 중...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

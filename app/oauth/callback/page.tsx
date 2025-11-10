'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { getCurrentUser } from '@/lib/api/user';
import { Loader2 } from 'lucide-react';

function OAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      // URL 파라미터에서 오류 확인
      const error = searchParams.get('error');

      if (error) {
        // 로그인 실패
        console.error('로그인 실패:', error);
        router.replace('/');
        return;
      }

      // JWT 토큰 추출 (쿼리 파라미터에서)
      const token = searchParams.get('token');

      if (!token) {
        console.error('JWT 토큰이 없습니다.');
        router.replace('/');
        return;
      }

      try {
        // JWT 토큰을 localStorage에 저장
        localStorage.setItem('jwt_token', token);
        console.log('JWT 토큰 저장 완료');

        // 사용자 정보 가져오기 (토큰이 헤더에 자동으로 포함됨)
        const userInfo = await getCurrentUser();
        console.log('사용자 정보:', userInfo);

        // 인증 상태에 사용자 정보 저장
        // 백엔드 응답 형식에 맞게 매핑
        login({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          role: 'user', // 백엔드 응답에 role이 있으면 그걸 사용하도록 수정 가능
        });

        // 홈으로 이동 (또는 대시보드)
        router.replace('/dashboard');
      } catch (err) {
        console.error('사용자 정보 가져오기 실패:', err);
        // 토큰이 유효하지 않으면 삭제
        localStorage.removeItem('jwt_token');
        router.replace('/');
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  return null;
}

export default function OAuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">로그인 처리 중...</p>
          </div>
        </div>
      }
    >
      <OAuthHandler />
    </Suspense>
  );
}


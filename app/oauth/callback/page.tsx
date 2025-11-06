'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { getCurrentUser } from '@/lib/api/user';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
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

      try {
        // 사용자 정보 가져오기
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
        router.replace('/');
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}


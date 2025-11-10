'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { HeroSection } from '@/components/landing/HeroSection';
import { DashboardPreview } from '@/components/landing/DashboardPreview';

export default function LandingPage() {
  const router = useRouter();
  const { login, setToken } = useAuthStore();

  const handleGoogleLogin = () => {
    // 요구사항: 구글 버튼 클릭 시 즉시 대시보드로 이동
    // 대시보드 보호 라우트 통과를 위해 임시 토큰과 사용자 세션 설정
    setToken('dev-mock-token');
    login({
      id: 'dev-user',
      email: 'dev@budgetops.local',
      name: 'Developer',
      role: 'user',
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <HeroSection onGoogleLogin={handleGoogleLogin} />
      <DashboardPreview />
    </div>
  );
}
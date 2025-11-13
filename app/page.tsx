'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { DashboardPreview } from '@/components/landing/DashboardPreview';

export default function LandingPage() {
  const handleGoogleLogin = () => {
    // 백엔드 OAuth 로그인 엔드포인트로 리다이렉트
    // 프로덕션: https://api.budgetops.work
    // 로컬 개발: http://localhost:8080 (환경 변수로 설정)
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.budgetops.work';
    window.location.href = `${apiBase}/oauth2/authorization/google`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <HeroSection onGoogleLogin={handleGoogleLogin} />
      <DashboardPreview />
    </div>
  );
}
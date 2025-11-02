'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { BACKEND_BASE_URL } from '@/lib/api/client';

export default function LandingPage() {
  const handleGoogleLogin = () => {
    // 백엔드 OAuth2 로그인 경로로 리다이렉트
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <HeroSection onGoogleLogin={handleGoogleLogin} />
      <DashboardPreview />
    </div>
  );
}
'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { DashboardPreview } from '@/components/landing/DashboardPreview';

export default function LandingPage() {
  const handleGoogleLogin = () => {
    // 백엔드 OAuth 로그인 엔드포인트로 리다이렉트
    // NEXT_PUBLIC_API_BASE_URL은 일반적으로 http://localhost:8080/api 형식
    //const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // /api/auth/google 경로로 리다이렉트
    // apiBaseUrl이 이미 /api로 끝나므로 /auth/google만 추가
    //window.location.href = `${apiBaseUrl}/auth/google`;
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE}/oauth2/authorization/google`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <HeroSection onGoogleLogin={handleGoogleLogin} />
      <DashboardPreview />
    </div>
  );
}
'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { DashboardPreview } from '@/components/landing/DashboardPreview';

export default function LandingPage() {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <HeroSection onGoogleLogin={handleGoogleLogin} />
      <DashboardPreview />
    </div>
  );
}
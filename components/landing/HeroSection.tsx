'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  onGoogleLogin: () => void;
}

export function HeroSection({ onGoogleLogin }: HeroSectionProps) {
  return (
    <div className="w-full lg:w-[480px] bg-white flex flex-col justify-center items-center px-12 border-r border-gray-200">
      <div className="w-full max-w-md lg:max-w-sm">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">BudgetOps</h1>
        </div>

        {/* Main CTA */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              클라우드 비용을 오늘부터 최적화하세요!
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              토이 프로젝트부터 스타트업까지, 학생 개발자의<br />클라우드 비용을 똑똑하게 관리하세요
            </p>
          </div>

          {/* Google OAuth Button */}
          <Button 
            onClick={onGoogleLogin}
            size="lg"
            className="w-full bg-white hover:bg-gray-50 text-gray-900 text-base font-medium py-6 border border-gray-300 shadow-sm"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </Button>

          {/* Features List */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">멀티 클라우드 비용 모니터링</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">AI 기반 이상 징후 탐지</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">자동화된 비용 최적화</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

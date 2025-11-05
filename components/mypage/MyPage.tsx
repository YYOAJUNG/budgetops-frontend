'use client';

import { MyInfo } from './MyInfo';
import { CloudAccountConnection } from './CloudAccountConnection';
import { SubscriptionPayment } from './SubscriptionPayment';
import { Settings } from './Settings';
import { useEffect } from 'react';
import { useUIStore } from '@/store/ui';

export function MyPage() {
  const { targetSection, setTargetSection } = useUIStore((s) => ({
    targetSection: s.targetSection,
    setTargetSection: s.setTargetSection,
  }));

  useEffect(() => {
    if (targetSection) {
      const el = document.getElementById(targetSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTargetSection(null);
    }
  }, [targetSection, setTargetSection]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이 페이지</h1>
          <p className="text-gray-600">사용자 프로필 및 설정을 관리합니다.</p>
        </div>

        <div className="space-y-6">
          {/* 내 정보 섹션 */}
          <div id="info" className="scroll-mt-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <MyInfo />
            </div>
          </div>

          {/* 클라우드 계정 연동 섹션 */}
          <div id="accounts" className="scroll-mt-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <CloudAccountConnection />
            </div>
          </div>

          {/* 구독 및 결제 섹션 */}
          <div id="subscription" className="scroll-mt-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <SubscriptionPayment />
            </div>
          </div>

          {/* 설정 섹션 */}
          <div id="settings" className="scroll-mt-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <Settings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

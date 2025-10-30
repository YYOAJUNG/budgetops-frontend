'use client';

import { useState } from 'react';
import { Bell, Mail, Globe, Shield, Moon, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { SettingsState } from '@/types/mypage';

export function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      budgetAlerts: true,
      anomalyDetection: true,
      weeklyReport: true,
      monthlyReport: false,
    },
    email: {
      marketing: false,
      productUpdates: true,
      securityAlerts: true,
    },
    preferences: {
      language: 'ko',
      currency: 'KRW',
      timezone: 'Asia/Seoul',
      theme: 'light',
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      twoFactorAuth: false,
    },
  });

  const handleToggle = (section: keyof SettingsState, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]],
      },
    }));
  };

  const handleSelectChange = (section: 'preferences', key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // TODO: API 호출로 설정 저장
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">설정</h2>
          <p className="text-gray-600 mt-1">애플리케이션 설정을 관리하세요</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          변경사항 저장
        </Button>
      </div>

      <div className="space-y-6">
        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-700" />
              알림 설정
            </CardTitle>
            <CardDescription>
              앱 내 알림 및 푸시 알림을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">예산 알림</p>
                <p className="text-sm text-gray-600">예산 임계값 도달 시 알림</p>
              </div>
              <Toggle
                checked={settings.notifications.budgetAlerts}
                onChange={() => handleToggle('notifications', 'budgetAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">이상징후 탐지</p>
                <p className="text-sm text-gray-600">비정상적인 지출 패턴 감지 시 알림</p>
              </div>
              <Toggle
                checked={settings.notifications.anomalyDetection}
                onChange={() => handleToggle('notifications', 'anomalyDetection')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">주간 리포트</p>
                <p className="text-sm text-gray-600">매주 비용 요약 리포트</p>
              </div>
              <Toggle
                checked={settings.notifications.weeklyReport}
                onChange={() => handleToggle('notifications', 'weeklyReport')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">월간 리포트</p>
                <p className="text-sm text-gray-600">매월 상세 비용 리포트</p>
              </div>
              <Toggle
                checked={settings.notifications.monthlyReport}
                onChange={() => handleToggle('notifications', 'monthlyReport')}
              />
            </div>
          </CardContent>
        </Card>

        {/* 이메일 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-700" />
              이메일 설정
            </CardTitle>
            <CardDescription>
              이메일 수신 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">마케팅 이메일</p>
                <p className="text-sm text-gray-600">프로모션 및 뉴스레터</p>
              </div>
              <Toggle
                checked={settings.email.marketing}
                onChange={() => handleToggle('email', 'marketing')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">제품 업데이트</p>
                <p className="text-sm text-gray-600">새로운 기능 및 개선사항</p>
              </div>
              <Toggle
                checked={settings.email.productUpdates}
                onChange={() => handleToggle('email', 'productUpdates')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">보안 알림</p>
                <p className="text-sm text-gray-600">계정 보안 관련 중요 알림</p>
              </div>
              <Toggle
                checked={settings.email.securityAlerts}
                onChange={() => handleToggle('email', 'securityAlerts')}
              />
            </div>
          </CardContent>
        </Card>

        {/* 환경 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-700" />
              환경 설정
            </CardTitle>
            <CardDescription>
              언어, 통화, 시간대 등을 설정합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                언어
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                통화
              </label>
              <select
                value={settings.preferences.currency}
                onChange={(e) => handleSelectChange('preferences', 'currency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="KRW">KRW (₩)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                시간대
              </label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) => handleSelectChange('preferences', 'timezone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Seoul">서울 (UTC+9)</option>
                <option value="America/New_York">뉴욕 (UTC-5)</option>
                <option value="Europe/London">런던 (UTC+0)</option>
                <option value="Asia/Tokyo">도쿄 (UTC+9)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  테마
                </div>
              </label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => handleSelectChange('preferences', 'theme', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">라이트</option>
                <option value="dark">다크</option>
                <option value="auto">시스템 설정</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 보안 및 개인정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-700" />
              보안 및 개인정보
            </CardTitle>
            <CardDescription>
              계정 보안 및 개인정보 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">2단계 인증</p>
                <p className="text-sm text-gray-600">추가 보안 계층 활성화</p>
              </div>
              <Toggle
                checked={settings.privacy.twoFactorAuth}
                onChange={() => handleToggle('privacy', 'twoFactorAuth')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">데이터 공유</p>
                <p className="text-sm text-gray-600">제품 개선을 위한 익명 데이터 공유</p>
              </div>
              <Toggle
                checked={settings.privacy.dataSharing}
                onChange={() => handleToggle('privacy', 'dataSharing')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">사용 분석</p>
                <p className="text-sm text-gray-600">앱 사용 통계 수집</p>
              </div>
              <Toggle
                checked={settings.privacy.analytics}
                onChange={() => handleToggle('privacy', 'analytics')}
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
              >
                비밀번호 변경
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 데이터 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-700" />
              데이터 관리
            </CardTitle>
            <CardDescription>
              데이터 내보내기 및 삭제를 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">데이터 내보내기</p>
                <p className="text-sm text-gray-600">모든 데이터를 다운로드</p>
              </div>
              <Button variant="outline" className="border-gray-300 text-gray-700">
                내보내기
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-red-900">모든 데이터 삭제</p>
                <p className="text-sm text-red-600">이 작업은 되돌릴 수 없습니다</p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                삭제
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

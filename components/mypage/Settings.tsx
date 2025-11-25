'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Globe, Shield, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { SettingsState } from '@/types/mypage';
import { deleteCurrentUser } from '@/lib/api/user';
import { useAuthStore } from '@/store/auth';

// 모바일 반응형 관련 상수
const MOBILE_RESPONSIVE_TEXT = 'text-sm md:text-base';
const MOBILE_RESPONSIVE_BUTTON = 'w-full md:w-auto';
const MOBILE_HEADER_LAYOUT = 'flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4';
const MOBILE_TOGGLE_LAYOUT = 'flex items-center justify-between gap-4';

export function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      budgetAlerts: true,
      anomalyDetection: true,
      slackNotifications: true,
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
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();

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

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;

    const confirmed = window.confirm(
      '정말로 회원 탈퇴를 진행하시겠습니까?\n모든 클라우드 연동 정보와 결제/빌링 데이터가 삭제되며 이 작업은 되돌릴 수 없습니다.'
    );
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      await deleteCurrentUser();
      await logout();
      alert('회원 탈퇴가 완료되었습니다. 지금까지 이용해 주셔서 감사합니다.');
      router.push('/');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        '회원 탈퇴 처리 중 문제가 발생했습니다.';
      alert(message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className={MOBILE_HEADER_LAYOUT}>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">설정</h2>
          <p className={`${MOBILE_RESPONSIVE_TEXT} text-gray-600 mt-1`}>애플리케이션 설정을 관리하세요</p>
        </div>
        <Button
          onClick={handleSave}
          className={`bg-blue-600 hover:bg-blue-700 text-white ${MOBILE_RESPONSIVE_BUTTON}`}
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
            <div className={MOBILE_TOGGLE_LAYOUT}>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 ${MOBILE_RESPONSIVE_TEXT}`}>예산 알림</p>
                <p className="text-xs md:text-sm text-gray-600">예산 임계값 도달 시 알림</p>
              </div>
              <Toggle
                checked={settings.notifications.budgetAlerts}
                onChange={() => handleToggle('notifications', 'budgetAlerts')}
              />
            </div>

            <div className={MOBILE_TOGGLE_LAYOUT}>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 ${MOBILE_RESPONSIVE_TEXT}`}>이상징후 탐지</p>
                <p className="text-xs md:text-sm text-gray-600">비정상적인 지출 패턴 감지 시 알림</p>
              </div>
              <Toggle
                checked={settings.notifications.anomalyDetection}
                onChange={() => handleToggle('notifications', 'anomalyDetection')}
              />
            </div>

            <div className={MOBILE_TOGGLE_LAYOUT}>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 ${MOBILE_RESPONSIVE_TEXT}`}>Slack 알림</p>
                <p className="text-xs md:text-sm text-gray-600">리소스 상태 및 임계값 초과 시 Slack으로 알림 전송</p>
              </div>
              <Toggle
                checked={settings.notifications.slackNotifications}
                onChange={() => handleToggle('notifications', 'slackNotifications')}
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

            <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
              >
                비밀번호 변경
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingAccount ? '탈퇴 처리 중...' : '회원 탈퇴'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
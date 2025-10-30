import { SubscriptionPlan, CloudProvider } from '@/types/mypage';

// Provider color mappings
export const PROVIDER_COLORS: Record<CloudProvider, string> = {
  AWS: 'bg-orange-100 text-orange-700 border-orange-200',
  GCP: 'bg-blue-100 text-blue-700 border-blue-200',
  Azure: 'bg-sky-100 text-sky-700 border-sky-200',
} as const;

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '무료',
    price: 0,
    period: '월',
    features: [
      '클라우드 계정 1개',
      '월 100만원 이하 비용 추적',
      '기본 리포트',
      '이메일 지원',
    ],
  },
  {
    id: 'pro',
    name: '프로',
    price: 4900,
    period: '월',
    popular: true,
    features: [
      '무제한 클라우드 계정',
      '무제한 비용 추적',
      '고급 분석 및 리포트',
      '이상징후 탐지',
      '비용 예측',
      '최적화 권장사항',
      '우선 지원',
    ],
  },
  {
    id: 'enterprise',
    name: '엔터프라이즈',
    price: null,
    period: '문의',
    features: [
      '프로 플랜의 모든 기능',
      '전담 계정 관리자',
      '맞춤형 대시보드',
      'SSO 통합',
      '온프레미스 배포 옵션',
      'SLA 보장',
      '24/7 전화 지원',
    ],
  },
] as const;

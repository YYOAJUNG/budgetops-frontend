import { Cloud, Target, Lightbulb, Calculator, FileText } from 'lucide-react';
import { Grid, DollarSquare, User, Sparkles, InboxArchive } from '@mynaui/icons-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  children?: Array<{ name: string; href: string }>;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: '대시보드', href: '/dashboard', icon: Grid },
  { name: '리소스 관리', href: '/accounts', icon: Cloud },
  { name: '비용 분석', href: '/costs', icon: DollarSquare },
  { name: 'AI 어시스턴트', href: '/copilot', icon: Sparkles },
  {
    name: '마이 페이지',
    href: '/mypage',
    icon: User,
    children: [
      { name: '내 정보', href: '/mypage#info' },
      { name: '클라우드 계정 연동', href: '/mypage#accounts' },
      { name: '구독 및 결제', href: '/mypage#subscription' },
      { name: '설정', href: '/mypage#settings' },
    ]
  },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Simulators', href: '/simulators/db-billing', icon: Calculator },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export const FEEDBACK_LINK = 'https://forms.google.com/your-form-url';

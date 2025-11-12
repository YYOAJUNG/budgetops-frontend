import { Cloud } from 'lucide-react';
import { Grid, DollarSquare, Sparkles } from '@mynaui/icons-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  children?: Array<{ name: string; href: string }>;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: '대시보드', href: '/dashboard', icon: Grid },
  { name: '리소스 관리', href: '/resources', icon: Cloud },
  { name: '비용 분석', href: '/costs', icon: DollarSquare },
  // { name: 'AI 어시스턴트', href: '/copilot', icon: Sparkles },
];

export const FEEDBACK_LINK = 'https://docs.google.com/forms/d/1qk64qDj26qbyUApxVwnG1mr_WgqVT1yRiSD1QIy6lA8/viewform?edit_requested=true';

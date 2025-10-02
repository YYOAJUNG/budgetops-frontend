import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  DollarSign, 
  Brain, 
  LogOut, 
  Cloud,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { trackButtonClick, trackPageView } from '../utils/analytics';
import { SurveyButton } from './SurveyButton';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'resources', label: '리소스 관리', icon: Server },
    { id: 'costs', label: '비용 분석', icon: DollarSign },
    { id: 'ai', label: 'AI 어시스턴스', icon: Brain },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-gray-900">CloudHub</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-11 ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                trackButtonClick(`nav_${item.id}`, 'Navigation', 'sidebar', { 
                  destination: item.label 
                });
                trackPageView(item.id, item.label);
                onNavigate(item.id);
              }}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-gray-700 hover:bg-gray-100"
          onClick={() => trackButtonClick('settings', 'Navigation', 'sidebar')}
        >
          <Settings className="w-4 h-4" />
          설정
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-gray-700 hover:bg-gray-100"
          onClick={() => trackButtonClick('help', 'Navigation', 'sidebar')}
        >
          <HelpCircle className="w-4 h-4" />
          도움말
        </Button>
        
        <SurveyButton 
          variant="ghost" 
          textType="medium"
          className="w-full justify-start h-11 text-gray-700 hover:bg-gray-100" 
        />
        
        <Separator className="my-2" />
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            trackButtonClick('logout', 'Authentication', 'sidebar');
            onLogout();
          }}
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}
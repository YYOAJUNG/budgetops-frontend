'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NAVIGATION_ITEMS, FEEDBACK_LINK } from '@/constants/navigation';
import { ChevronDown, Clock, User } from 'lucide-react';
import { InboxArchive } from '@mynaui/icons-react';
import { DashboardContent } from './preview/DashboardContent';
import { AccountsContent } from './preview/AccountsContent';
import { CostsContent } from './preview/CostsContent';
import { BudgetsContent } from './preview/BudgetsContent';
import { RecommendationsContent } from './preview/RecommendationsContent';
import { CopilotContent } from './preview/CopilotContent';

type MenuType = 'dashboard' | 'accounts' | 'costs' | 'copilot' | 'budgets' | 'recommendations' | 'simulators' | 'reports';

export function DashboardPreview() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 30 Days');
  const [selectedMenu, setSelectedMenu] = useState<MenuType>('dashboard');
  const [clickCount, setClickCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleMenuClick = (menu: MenuType) => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount >= 3) {
      setShowLoginPrompt(true);
    } else {
      setSelectedMenu(menu);
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'accounts':
        return <AccountsContent />;
      case 'costs':
        return <CostsContent />;
      case 'copilot':
        return <CopilotContent />;
      case 'budgets':
        return <BudgetsContent />;
      case 'recommendations':
        return <RecommendationsContent />;
      case 'simulators':
        return <div className="text-center text-gray-500">Simulators</div>;
      case 'reports':
        return <div className="text-center text-gray-500">Reports</div>;
      default:
        return <DashboardContent />;
    }
  };

  const getTitle = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return '대시보드';
      case 'accounts':
        return '리소스 관리';
      case 'costs':
        return '비용 분석';
      case 'copilot':
        return 'AI 어시스턴트';
      case 'budgets':
        return 'Budgets';
      case 'recommendations':
        return 'Recommendations';
      case 'simulators':
        return 'Simulators';
      case 'reports':
        return 'Reports';
      default:
        return '대시보드';
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative hidden lg:block">
      {/* Dashboard Preview Container */}
      <div className="absolute inset-0 overflow-auto flex justify-center items-center pointer-events-none">
        <div className="w-[90%] h-[90%] bg-gray-50 rounded-lg shadow-lg pointer-events-auto">
          <div className="flex h-full bg-gray-50 rounded-lg overflow-hidden">
            {/* Mini Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
              {/* Logo */}
              <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">BudgetOps</h1>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-auto">
                <div className="space-y-1">
                  {NAVIGATION_ITEMS.filter(item => !item.children).map((item) => {
                    const menuKey = item.href.split('/')[1].split('-')[0] as MenuType;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleMenuClick(menuKey)}
                        className={`flex items-center px-3 py-2.5 rounded-lg w-full transition-all duration-200 group ${
                          selectedMenu === menuKey ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`mr-3 h-5 w-5 transition-colors ${
                          selectedMenu === menuKey ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        <span className="text-sm">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Bottom section - 피드백 링크 */}
              <div className="p-4 border-t border-gray-200">
                <a
                  href={FEEDBACK_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <InboxArchive className="mr-3 h-5 w-5 text-blue-600" />
                  피드백 보내기
                </a>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    size="sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {selectedTimeRange}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient overlay at edges */}
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">더 많은 기능을 경험하세요</h2>
              <p className="text-gray-600">
                모든 기능을 사용하려면 로그인이 필요합니다.
              </p>
            </div>

            <Button
              onClick={() => window.location.href = '/api/auth/google'}
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

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                무료로 시작하고 클라우드 비용을 최적화하세요
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

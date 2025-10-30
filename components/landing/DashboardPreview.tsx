'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  Cloud,
  DollarSign,
  Target,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Settings,
  HelpCircle,
  User,
  ChevronDown,
  Clock,
  FileText,
  Bot,
  PieChart
} from 'lucide-react';
import { DashboardContent } from './preview/DashboardContent';
import { AccountsContent } from './preview/AccountsContent';
import { CostsContent } from './preview/CostsContent';
import { BudgetsContent } from './preview/BudgetsContent';
import { AnomaliesContent } from './preview/AnomaliesContent';
import { ForecastContent } from './preview/ForecastContent';
import { RecommendationsContent } from './preview/RecommendationsContent';
import { CopilotContent } from './preview/CopilotContent';

type MenuType = 'dashboard' | 'accounts' | 'costs' | 'budgets' | 'anomalies' | 'forecast' | 'recommendations' | 'copilot';

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
      case 'budgets':
        return <BudgetsContent />;
      case 'anomalies':
        return <AnomaliesContent />;
      case 'forecast':
        return <ForecastContent />;
      case 'recommendations':
        return <RecommendationsContent />;
      case 'copilot':
        return <CopilotContent />;
      default:
        return <DashboardContent />;
    }
  };

  const getTitle = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return '클라우드 비용 대시보드';
      case 'accounts':
        return '클라우드 계정 관리';
      case 'costs':
        return '비용 분석';
      case 'budgets':
        return '예산 관리';
      case 'anomalies':
        return '이상 징후 탐지';
      case 'forecast':
        return '비용 예측';
      case 'recommendations':
        return '최적화 권장사항';
      case 'copilot':
        return 'AI 코파일럿';
      default:
        return '클라우드 비용 대시보드';
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative hidden lg:block">
      {/* Dashboard Preview Container */}
      <div className="absolute inset-0 overflow-auto flex justify-center items-center pointer-events-none">
        <div className="w-[90%] h-[90%] bg-gray-50 rounded-lg shadow-lg pointer-events-auto">
          <div className="flex h-full bg-gray-50 rounded-lg overflow-hidden">
            {/* Mini Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
              {/* Logo */}
              <div className="p-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-900">BudgetOps</span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 overflow-auto">
                <div className="space-y-1">
                  <button
                    onClick={() => handleMenuClick('dashboard')}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full transition-colors ${
                      selectedMenu === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span className="text-sm font-medium">대시보드</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick('accounts')}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full transition-colors ${
                      selectedMenu === 'accounts' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Cloud className="h-4 w-4" />
                    <span className="text-sm">클라우드 계정</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick('costs')}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full transition-colors ${
                      selectedMenu === 'costs' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">비용 분석</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick('budgets')}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full transition-colors ${
                      selectedMenu === 'budgets' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Target className="h-4 w-4" />
                    <span className="text-sm">예산</span>
                  </button>
                </div>

                <div className="mt-6">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase">분석</p>
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => handleMenuClick('anomalies')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full transition-colors ${
                        selectedMenu === 'anomalies' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">이상 징후 탐지</span>
                    </button>
                    <button
                      onClick={() => handleMenuClick('forecast')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full transition-colors ${
                        selectedMenu === 'forecast' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm">비용 예측</span>
                    </button>
                    <button
                      onClick={() => handleMenuClick('recommendations')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full transition-colors ${
                        selectedMenu === 'recommendations' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span className="text-sm">최적화</span>
                    </button>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 opacity-50">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">보고서</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase">도구</p>
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => handleMenuClick('copilot')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full transition-colors ${
                        selectedMenu === 'copilot' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Bot className="h-4 w-4" />
                      <span className="text-sm">AI 코파일럿</span>
                    </button>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 opacity-50">
                      <PieChart className="h-4 w-4" />
                      <span className="text-sm">시뮬레이터</span>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Bottom section */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 opacity-50">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">설정</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 opacity-50">
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-sm">도움말 및 지원</span>
                </div>
              </div>

              {/* User profile */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">관리자</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700"
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

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  PieChart,
  Zap
} from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the cost chart
const costChartData = [
  { date: '21 Jan', cost: 945 },
  { date: '22 Jan', cost: 1123 },
  { date: '23 Jan', cost: 1089 },
  { date: '24 Jan', cost: 1234 },
  { date: '25 Jan', cost: 1145 },
  { date: '26 Jan', cost: 1290 },
  { date: '27 Jan', cost: 1456 },
  { date: '28 Jan', cost: 1389 },
  { date: '29 Jan', cost: 1567 },
  { date: '30 Jan', cost: 1489 },
  { date: '31 Jan', cost: 1623 },
  { date: '1 Feb', cost: 1578 },
  { date: '2 Feb', cost: 1689 },
  { date: '3 Feb', cost: 1534 },
  { date: '4 Feb', cost: 1789 },
  { date: '5 Feb', cost: 1834 },
  { date: '6 Feb', cost: 1923 },
  { date: '7 Feb', cost: 1856 },
  { date: '8 Feb', cost: 1978 },
  { date: '9 Feb', cost: 1890 },
  { date: '10 Feb', cost: 2034 },
  { date: '11 Feb', cost: 1967 },
  { date: '12 Feb', cost: 2123 },
  { date: '13 Feb', cost: 2089 },
  { date: '14 Feb', cost: 2234 },
];

// Mock data for top cloud services
const topServices = [
  { rank: 1, service: 'AWS EC2', cost: 610, change: '4.7%', icon: '☁️' },
  { rank: 2, service: 'AWS S3', cost: 543, change: '0.0%', icon: '📦' },
  { rank: 3, service: 'AWS RDS', cost: 443, change: '8.43%', icon: '🗄️' },
  { rank: 4, service: 'AWS Lambda', cost: 321, change: '3.91%', icon: '⚡' },
  { rank: 5, service: 'AWS CloudFront', cost: 289, change: '2.89%', icon: '🌐' },
  { rank: 6, service: 'GCP Compute', cost: 246, change: '4%', icon: '🔧' },
  { rank: 7, service: 'Azure VM', cost: 238, change: '6%', icon: '💻' },
  { rank: 8, service: 'AWS EKS', cost: 232, change: '9%', icon: '🐳' },
];

const topAccounts = [
  { account: 'Production AWS', cost: 2133, change: '4.7%' },
  { account: 'Staging GCP', cost: 456, change: '4.56%' },
  { account: 'Dev Azure', cost: 443, change: '4.43%' },
  { account: 'Analytics AWS', cost: 391, change: '3.91%' },
  { account: 'Backup GCP', cost: 289, change: '2.89%' },
  { account: 'Testing Azure', cost: 216, change: '2.16%' },
  { account: 'Monitoring AWS', cost: 146, change: '1.46%' },
  { account: 'CDN GCP', cost: 138, change: '1.38%' },
];

export function DashboardPreview() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 30 Days');

  return (
    <div className="flex-1 overflow-hidden relative hidden lg:block">
      {/* Dashboard Preview Container */}
      <div className="absolute inset-0 overflow-auto flex justify-center items-center">
        <div className="w-[90%] h-[90%] bg-gray-50 rounded-lg shadow-lg">
          <div className="flex h-full bg-gray-50 rounded-lg">
            {/* Mini Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
              {/* Logo */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-[#eef2f9] border border-slate-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600">B</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">BudgetOps</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
                    <Home className="h-4 w-4" />
                    <span className="text-sm font-medium">대시보드</span>
                  </div>
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                    <Cloud className="h-4 w-4" />
                    <span className="text-sm">클라우드 계정</span>
                  </div>
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">비용 분석</span>
                  </div>
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">예산</span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase">분석</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">이상 징후 탐지</span>
                    </div>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm">비용 예측</span>
                    </div>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                      <Lightbulb className="h-4 w-4" />
                      <span className="text-sm">최적화</span>
                    </div>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">보고서</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase">도구</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                      <Bot className="h-4 w-4" />
                      <span className="text-sm">AI 코파일럿</span>
                    </div>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                      <PieChart className="h-4 w-4" />
                      <span className="text-sm">시뮬레이터</span>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Bottom section */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">설정</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700">
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
                  <h1 className="text-2xl font-bold text-gray-900">클라우드 비용 대시보드</h1>
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

              {/* Stats Cards */}
              <div className="p-8">
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm text-gray-600">월간 총 비용</p>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">$4,365</span>
                        <Badge variant="outline" className="ml-2 text-xs text-red-500 border-red-200 bg-red-50">
                          +5.6%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-2">
                        <Target className="h-4 w-4 text-blue-500 mr-2" />
                        <p className="text-sm text-gray-600">예산 소진률</p>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">78%</span>
                        <Badge variant="outline" className="ml-2 text-xs text-green-500 border-green-200 bg-green-50">
                          +2.1%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                        <p className="text-sm text-gray-600">탐지된 이상 징후</p>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">12</span>
                        <Badge variant="outline" className="ml-2 text-xs text-red-500 border-red-200 bg-red-50">
                          +3
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-2">
                        <Zap className="h-4 w-4 text-purple-500 mr-2" />
                        <p className="text-sm text-gray-600">예상 절감액</p>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">$1,234</span>
                        <Badge variant="outline" className="ml-2 text-xs text-green-500 border-green-200 bg-green-50">
                          +8.34%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart */}
                <Card className="bg-white border-gray-200 mb-8">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">일일 클라우드 비용</h3>
                      <p className="text-sm text-gray-600">시간에 따른 지출 트렌드를 추적하세요</p>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={costChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`$${value}`, '비용']}
                            labelStyle={{ color: '#374151' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cost" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Tables */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Top Services */}
                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 클라우드 서비스</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 pb-2 border-b border-gray-100">
                          <span className="w-12">서비스</span>
                          <span className="flex-1 ml-4">이름</span>
                          <span className="w-20 text-right">비용</span>
                          <span className="w-16 text-right">변화</span>
                        </div>
                        {topServices.slice(0, 8).map((service) => (
                          <div key={service.rank} className="flex items-center text-sm py-1.5">
                            <span className="w-12 text-gray-600">{service.icon}</span>
                            <span className="flex-1 ml-4 text-gray-900">{service.service}</span>
                            <span className="w-20 text-right text-gray-900">${service.cost}</span>
                            <span className="w-16 text-right">
                              <Badge variant="outline" className="text-xs">
                                {service.change}
                              </Badge>
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Accounts */}
                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 클라우드 계정</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 pb-2 border-b border-gray-100">
                          <span className="flex-1">계정</span>
                          <span className="w-20 text-right">비용</span>
                          <span className="w-16 text-right">변화</span>
                        </div>
                        {topAccounts.slice(0, 8).map((account) => (
                          <div key={account.account} className="flex items-center text-sm py-1.5">
                            <span className="flex-1 text-gray-900">{account.account}</span>
                            <span className="w-20 text-right text-gray-900">${account.cost.toLocaleString()}</span>
                            <span className="w-16 text-right">
                              <Badge variant="outline" className="text-xs">
                                {account.change}
                              </Badge>
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to prevent interaction */}
      <div className="absolute inset-0 bg-transparent" style={{ pointerEvents: 'none' }}></div>
      
      {/* Subtle gradient overlay at edges */}
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
    </div>
  );
}

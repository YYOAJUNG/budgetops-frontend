import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { trackButtonClick } from '../utils/analytics';
import { SurveyButton } from './SurveyButton';

interface CostAnalysisProps {
  onNavigate: (page: string) => void;
}

export function CostAnalysis({ onNavigate }: CostAnalysisProps) {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Mock data
  const costTrend = [
    { month: '1월', cost: 45, budget: 60, freeTier: 12 },
    { month: '2월', cost: 52, budget: 60, freeTier: 15 },
    { month: '3월', cost: 48, budget: 60, freeTier: 18 },
    { month: '4월', cost: 38, budget: 60, freeTier: 8 },
    { month: '5월', cost: 42, budget: 60, freeTier: 12 },
    { month: '6월', cost: 35, budget: 60, freeTier: 10 },
  ];

  const serviceBreakdown = [
    { name: 'EC2/Compute', value: 45, cost: '$15.75', color: '#3b82f6' },
    { name: 'Storage', value: 25, cost: '$8.75', color: '#10b981' },
    { name: 'Database', value: 20, cost: '$7.00', color: '#f59e0b' },
    { name: 'Network', value: 10, cost: '$3.50', color: '#8b5cf6' },
  ];

  const providerCosts = [
    { provider: 'AWS', current: 22.50, previous: 28.00, services: 8 },
    { provider: 'Azure', current: 8.75, previous: 12.30, services: 3 },
    { provider: 'GCP', current: 3.75, previous: 4.20, services: 2 },
  ];

  const freeTierUsage = [
    { service: 'EC2 인스턴스', used: 680, limit: 750, unit: '시간', provider: 'AWS', remaining: 70 },
    { service: 'S3 스토리지', used: 18, limit: 20, unit: 'GB', provider: 'AWS', remaining: 2 },
    { service: 'RDS 인스턴스', used: 156, limit: 750, unit: '시간', provider: 'AWS', remaining: 594 },
    { service: 'VM 인스턴스', used: 45, limit: 100, unit: '시간', provider: 'Azure', remaining: 55 },
    { service: 'Cloud Functions', used: 1800000, limit: 2000000, unit: '호출', provider: 'GCP', remaining: 200000 },
  ];

  const costOptimizations = [
    {
      title: '미사용 리소스 정리',
      description: '7일 이상 사용하지 않은 3개의 인스턴스를 발견했습니다.',
      potentialSavings: 45,
      effort: 'low',
      impact: 'high',
      category: 'cleanup'
    },
    {
      title: '인스턴스 크기 최적화',
      description: 'CPU 사용률이 낮은 인스턴스들을 더 작은 크기로 변경할 수 있습니다.',
      potentialSavings: 28,
      effort: 'medium',
      impact: 'medium',
      category: 'rightsizing'
    },
    {
      title: '예약 인스턴스 활용',
      description: '장기 실행 인스턴스에 예약 인스턴스를 적용하여 비용을 절약하세요.',
      potentialSavings: 67,
      effort: 'low',
      impact: 'high',
      category: 'commitment'
    },
    {
      title: '스토리지 클래스 최적화',
      description: '자주 접근하지 않는 데이터를 저렴한 스토리지로 이동하세요.',
      potentialSavings: 15,
      effort: 'medium',
      impact: 'low',
      category: 'storage'
    }
  ];

  const monthlyReports = [
    { month: '2024년 6월', totalCost: 35.50, savings: 24.50, status: 'completed' },
    { month: '2024년 5월', totalCost: 42.30, savings: 18.20, status: 'completed' },
    { month: '2024년 4월', totalCost: 38.90, savings: 22.10, status: 'completed' },
  ];

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-purple-100 text-purple-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">비용 분석</h1>
          <p className="text-gray-600 mt-1">클라우드 비용을 분석하고 최적화 방안을 찾아보세요</p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={timeRange} 
            onValueChange={(value) => {
              setTimeRange(value);
              trackButtonClick('change_time_range', 'Filter', 'costs', {
                time_range: value
              });
            }}
          >
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1개월</SelectItem>
              <SelectItem value="3months">3개월</SelectItem>
              <SelectItem value="6months">6개월</SelectItem>
              <SelectItem value="1year">1년</SelectItem>
            </SelectContent>
          </Select>
          <SurveyButton variant="outline" size="md" textType="short" />
          <Button 
            variant="outline"
            onClick={() => trackButtonClick('download_report', 'Export', 'costs')}
          >
            <Download className="w-4 h-4 mr-2" />
            리포트 다운로드
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              trackButtonClick('ai_optimization', 'Navigation', 'costs');
              onNavigate('ai');
            }}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI 최적화
          </Button>
        </div>
      </div>

      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">이번 달 비용</p>
                <p className="text-2xl font-bold text-gray-900">$35.00</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -16.7% 전월 대비
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">프리티어 절약</p>
                <p className="text-2xl font-bold text-gray-900">$127</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Target className="w-3 h-3 mr-1" />
                  이번 달
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">예산 대비</p>
                <p className="text-2xl font-bold text-gray-900">58%</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  $60 예산
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">절약 가능</p>
                <p className="text-2xl font-bold text-gray-900">$155</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Brain className="w-3 h-3 mr-1" />
                  AI 분석 기반
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="freetier">프리티어</TabsTrigger>
          <TabsTrigger value="optimization">최적화</TabsTrigger>
          <TabsTrigger value="reports">리포트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  비용 추이
                </CardTitle>
                <CardDescription>최근 6개월 비용 변화 및 예산 비교</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={costTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        `$${value}`, 
                        name === 'cost' ? '실제 비용' : name === 'budget' ? '예산' : '프리티어 절약'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="budget" 
                      stroke="#e5e7eb" 
                      fill="#f9fafb" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#3b82f6" 
                      fill="#dbeafe" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="freeTier" 
                      stroke="#10b981" 
                      fill="#d1fae5" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  서비스별 비용 분석
                </CardTitle>
                <CardDescription>이번 달 총 $35.00</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={serviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {serviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '비율']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {serviceBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{item.cost}</span>
                        <span className="text-xs text-gray-500 ml-2">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>프로바이더별 비용 비교</CardTitle>
              <CardDescription>이번 달 vs 지난 달 비용 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerCosts.map((provider) => {
                  const change = ((provider.current - provider.previous) / provider.previous * 100);
                  const isIncrease = change > 0;
                  
                  return (
                    <div key={provider.provider} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          provider.provider === 'AWS' ? 'bg-orange-100' :
                          provider.provider === 'Azure' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <span className={`font-semibold ${
                            provider.provider === 'AWS' ? 'text-orange-600' :
                            provider.provider === 'Azure' ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {provider.provider === 'AWS' ? 'AWS' : 
                             provider.provider === 'Azure' ? 'AZ' : 'GCP'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{provider.provider}</h3>
                          <p className="text-sm text-gray-600">{provider.services}개 서비스</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${provider.current.toFixed(2)}</p>
                        <p className={`text-sm flex items-center ${
                          isIncrease ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {isIncrease ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(change).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="freetier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                프리티어 사용량
              </CardTitle>
              <CardDescription>무료 한도 사용 현황을 확인하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {freeTierUsage.map((service, index) => {
                  const usagePercent = (service.used / service.limit) * 100;
                  const isNearLimit = usagePercent > 80;
                  
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">{service.service}</h3>
                          <Badge variant="outline" className={
                            service.provider === 'AWS' ? 'bg-orange-100 text-orange-700' :
                            service.provider === 'Azure' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }>
                            {service.provider}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {service.used.toLocaleString()} / {service.limit.toLocaleString()} {service.unit}
                          </p>
                          <p className={`text-xs ${isNearLimit ? 'text-red-600' : 'text-gray-500'}`}>
                            {service.remaining.toLocaleString()} {service.unit} 남음
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Progress 
                          value={usagePercent} 
                          className={`h-2 ${isNearLimit ? '[&>[data-state=filled]]:bg-red-500' : ''}`}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>사용률: {usagePercent.toFixed(1)}%</span>
                          {isNearLimit && (
                            <span className="text-red-600 flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              한도 임박
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI 기반 비용 최적화 제안
              </CardTitle>
              <CardDescription>총 $155/월 절약 가능</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {costOptimizations.map((optimization, index) => (
                  <div key={index} className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{optimization.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{optimization.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getEffortColor(optimization.effort)}>
                            {optimization.effort === 'low' ? '쉬움' : optimization.effort === 'medium' ? '보통' : '어려움'}
                          </Badge>
                          <Badge variant="outline" className={getImpactColor(optimization.impact)}>
                            {optimization.impact === 'high' ? '높은 효과' : optimization.impact === 'medium' ? '보통 효과' : '낮은 효과'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-green-600">${optimization.potentialSavings}</p>
                        <p className="text-xs text-gray-500">월 절약</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => onNavigate('ai')}
                    >
                      세부 계획 보기
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>월별 비용 리포트</CardTitle>
              <CardDescription>상세한 비용 분석 리포트를 다운로드하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{report.month} 리포트</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          총 비용: <span className="font-medium">${report.totalCost}</span>
                        </span>
                        <span className="text-sm text-green-600">
                          절약: <span className="font-medium">${report.savings}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        완료
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3 mr-1" />
                        다운로드
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
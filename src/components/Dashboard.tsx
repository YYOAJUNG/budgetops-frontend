import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Server, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Brain
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { trackButtonClick } from '../utils/analytics';
import { SurveyButton } from './SurveyButton';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  // Mock data
  const costData = [
    { month: '1월', cost: 45 },
    { month: '2월', cost: 52 },
    { month: '3월', cost: 48 },
    { month: '4월', cost: 38 },
    { month: '5월', cost: 42 },
    { month: '6월', cost: 35 },
  ];

  const usageData = [
    { time: '00:00', cpu: 25, memory: 45 },
    { time: '04:00', cpu: 35, memory: 52 },
    { time: '08:00', cpu: 65, memory: 68 },
    { time: '12:00', cpu: 78, memory: 75 },
    { time: '16:00', cpu: 82, memory: 80 },
    { time: '20:00', cpu: 45, memory: 58 },
  ];

  const cloudDistribution = [
    { name: 'AWS', value: 45, color: '#FF9500' },
    { name: 'Azure', value: 30, color: '#0078D4' },
    { name: 'GCP', value: 25, color: '#4285F4' },
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'EC2 인스턴스 CPU 사용률이 85%를 초과했습니다', time: '5분 전', severity: 'high' },
    { id: 2, type: 'info', message: '프리티어 한도의 80%를 사용했습니다', time: '1시간 전', severity: 'medium' },
    { id: 3, type: 'success', message: 'Azure 비용이 예상보다 15% 절약되었습니다', time: '3시간 전', severity: 'low' },
  ];

  const aiRecommendations = [
    { 
      title: '리소스 최적화', 
      description: '사용하지 않는 3개의 인스턴스를 중지하여 월 $45 절약 가능합니다.',
      savings: '$45/월',
      action: '최적화 적용'
    },
    { 
      title: '스토리지 정리', 
      description: '오래된 스냅샷 7개를 정리하여 월 $12 절약 가능합니다.',
      savings: '$12/월',
      action: '정리하기'
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">멀티클라우드 환경을 한눈에 확인하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            모든 서비스 정상
          </Badge>
          <SurveyButton variant="outline" size="md" textType="short" />
          <Button 
            onClick={() => {
              trackButtonClick('ai_analysis_view', 'Navigation', 'dashboard');
              onNavigate('ai');
            }} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI 분석 보기
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">총 리소스</p>
                <p className="text-2xl font-bold text-gray-900">24개</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3 이번 주
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">월 비용</p>
                <p className="text-2xl font-bold text-gray-900">$35</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -16% 전월 대비
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">프리티어 사용률</p>
                <p className="text-2xl font-bold text-gray-900">73%</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  한도 주의
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">절약 가능</p>
                <p className="text-2xl font-bold text-gray-900">$57</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Brain className="w-3 h-3 mr-1" />
                  AI 추천 기반
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              월별 비용 추이
            </CardTitle>
            <CardDescription>최근 6개월간 클라우드 비용 변화</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`$${value}`, '비용']}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#10b981" 
                  fill="#d1fae5" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              실시간 리소스 사용률
            </CardTitle>
            <CardDescription>CPU 및 메모리 사용률 (24시간)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value}%`, name === 'cpu' ? 'CPU' : '메모리']}
                />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cloud Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">클라우드 분산</CardTitle>
            <CardDescription>서비스별 리소스 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={cloudDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cloudDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '점유율']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {cloudDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              최근 알림
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  trackButtonClick('view_all_alerts', 'Navigation', 'dashboard');
                  onNavigate('resources');
                }}
              >
                모두 보기
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-red-500' :
                  alert.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI 추천
            </CardTitle>
            <CardDescription>비용 절약 기회</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {rec.savings}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                <Button 
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    trackButtonClick(`ai_recommendation_${rec.action}`, 'AI', 'dashboard', {
                      recommendation_title: rec.title,
                      potential_savings: rec.savings
                    });
                    onNavigate('ai');
                  }}
                >
                  {rec.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
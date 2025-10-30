import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Target, AlertTriangle, Lightbulb, Plus, Cloud, Bot } from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="이번 달 총 비용"
          value="$4,365"
          change={{
            value: 5.6,
            label: '전월 대비'
          }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="예산 소진률"
          value="78%"
          change={{
            value: 2.1,
            label: '전월 대비'
          }}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          title="이상징후 (7일)"
          value="12"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="예상 절감액"
          value="$1,234"
          icon={<Lightbulb className="h-4 w-4" />}
        />
      </div>

      {/* 빠른 작업 */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">빠른 작업</CardTitle>
          <CardDescription className="text-gray-600">자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
              <Cloud className="mr-2 h-4 w-4" />
              계정 연결
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
              <Plus className="mr-2 h-4 w-4" />
              예산 만들기
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
              <Bot className="mr-2 h-4 w-4" />
              코파일럿 열기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 비용 차트 */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">일일 클라우드 비용</CardTitle>
          <CardDescription className="text-gray-600">시간에 따른 지출 트렌드를 추적하세요</CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* 테이블 섹션 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">상위 클라우드 서비스</CardTitle>
            <CardDescription className="text-gray-600">비용이 가장 많이 발생하는 서비스</CardDescription>
          </CardHeader>
          <CardContent>
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

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">상위 클라우드 계정</CardTitle>
            <CardDescription className="text-gray-600">계정별 비용 분석</CardDescription>
          </CardHeader>
          <CardContent>
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
  );
}

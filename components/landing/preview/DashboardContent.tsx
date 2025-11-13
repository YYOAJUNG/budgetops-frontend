import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, Lightbulb, Plus, Cloud, Bot, Gift } from 'lucide-react';

// Mock CSP별 비용 데이터
const mockAwsAccounts = [
  { accountId: 1, accountName: 'Production AWS', totalCost: 1245.50 },
  { accountId: 2, accountName: 'Development AWS', totalCost: 423.20 },
];

const mockGcpAccounts = [
  { accountId: 1, accountName: 'Production GCP', totalCost: 892.30 },
];

const mockAzureAccounts = [
  { accountId: 1, accountName: 'Production Azure', totalCost: 628.00 },
];

export function DashboardContent() {
  const totalAwsCost = mockAwsAccounts.reduce((sum, acc) => sum + acc.totalCost, 0);
  const totalGcpCost = mockGcpAccounts.reduce((sum, acc) => sum + acc.totalCost, 0);
  const totalAzureCost = mockAzureAccounts.reduce((sum, acc) => sum + acc.totalCost, 0);
  const totalCost = totalAwsCost + totalGcpCost + totalAzureCost;

  return (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="이번 달 총 비용"
          value={`$${totalCost.toLocaleString()}`}
          change={{
            value: 5.6,
            label: '전월 대비',
          }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="예산 소진률"
          value="78.0%"
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          title="프리티어 사용률"
          value="45.2%"
          icon={<Gift className="h-4 w-4" />}
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
          <CardDescription className="text-gray-600">
            자주 사용하는 기능에 빠르게 접근하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <Cloud className="mr-2 h-4 w-4" />
              계정 연결
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <Bot className="mr-2 h-4 w-4" />
              코파일럿 열기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSP별 비용 카드 */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">클라우드 서비스별 비용</h3>
          <p className="text-sm text-gray-600">최근 30일간의 비용을 확인하세요</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* AWS 계정 비용 카드 */}
          <Card className="shadow-lg border-0 bg-white border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Cloud className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">AWS</h4>
                    <p className="text-sm text-gray-600">{mockAwsAccounts.length}개 계정</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">총 비용</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${totalAwsCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid gap-3 sm:grid-cols-2">
                  {mockAwsAccounts.map((account) => (
                    <div
                      key={account.accountId}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {account.accountName}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ${account.totalCost.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GCP 계정 비용 카드 */}
          <Card className="shadow-lg border-0 bg-white border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Cloud className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">GCP</h4>
                    <p className="text-sm text-gray-600">{mockGcpAccounts.length}개 계정</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">총 비용</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${totalGcpCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid gap-3">
                  {mockGcpAccounts.map((account) => (
                    <div
                      key={account.accountId}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {account.accountName}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ${account.totalCost.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Azure 계정 비용 카드 */}
          <Card className="shadow-lg border-0 bg-white border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Cloud className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Azure</h4>
                    <p className="text-sm text-gray-600">{mockAzureAccounts.length}개 계정</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">총 비용</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${totalAzureCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid gap-3">
                  {mockAzureAccounts.map((account) => (
                    <div
                      key={account.accountId}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {account.accountName}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ${account.totalCost.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

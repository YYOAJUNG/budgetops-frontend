// 'use client';

// import { StatCard } from '@/components/ui/stat-card';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { useCostSeries, useBudgets, useAnomalies, useRecommendations } from '@/lib/api/queries';
// import { useContextStore } from '@/store/context';
// import { formatCurrency } from '@/lib/utils';
// import { DollarSign, Target, AlertTriangle, Lightbulb, Plus, Cloud, Bot } from 'lucide-react';

// export function Dashboard() {
//   const { tenantId, from, to, currency } = useContextStore();
//   const { data: costSeries } = useCostSeries({ tenantId, from, to });
//   const { data: budgets } = useBudgets(tenantId);
//   const { data: anomalies } = useAnomalies(tenantId);
//   const { data: recommendations } = useRecommendations(tenantId);

//   const currentMonthCost = costSeries?.[costSeries.length - 1]?.amount || 0;
//   const previousMonthCost = costSeries?.[costSeries.length - 2]?.amount || 0;
//   const costChange = previousMonthCost > 0 ? ((currentMonthCost - previousMonthCost) / previousMonthCost) * 100 : 0;

//   const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
//   const totalSpent = budgets?.reduce((sum, budget) => sum + (budget.spendToDate || 0), 0) || 0;
//   const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

//   const recentAnomalies = anomalies?.filter(a => 
//     new Date(a.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
//   ).length || 0;

//   const totalSavings = recommendations?.reduce((sum, rec) => sum + rec.saving, 0) || 0;

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
//         <p className="text-gray-600 mt-2">클라우드 비용 현황을 한눈에 확인하세요</p>
//       </div>

//       {/* 주요 지표 카드 */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <StatCard
//           title="이번 달 총 비용"
//           value={formatCurrency(currentMonthCost, currency)}
//           change={{
//             value: costChange,
//             label: '전월 대비'
//           }}
//           icon={<DollarSign className="h-4 w-4" />}
//         />
//         <StatCard
//           title="예산 소진률"
//           value={`${budgetUtilization.toFixed(1)}%`}
//           icon={<Target className="h-4 w-4" />}
//         />
//         <StatCard
//           title="이상징후 (7일)"
//           value={recentAnomalies}
//           icon={<AlertTriangle className="h-4 w-4" />}
//         />
//         <StatCard
//           title="예상 절감액"
//           value={formatCurrency(totalSavings, currency)}
//           icon={<Lightbulb className="h-4 w-4" />}
//         />
//       </div>

//       {/* 빠른 작업 */}
//       <Card className="shadow-lg border-0 bg-white">
//         <CardHeader className="pb-4">
//           <CardTitle className="text-xl font-semibold text-gray-900">빠른 작업</CardTitle>
//           <CardDescription className="text-gray-600">자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-wrap gap-4">
//             <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
//               <Cloud className="mr-2 h-4 w-4" />
//               계정 연결
//             </Button>
//             <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
//               <Plus className="mr-2 h-4 w-4" />
//               예산 만들기
//             </Button>
//             <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
//               <Bot className="mr-2 h-4 w-4" />
//               코파일럿 열기
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
'use client';

import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCostSeries, useBudgets, useAnomalies, useRecommendations } from '@/lib/api/queries';
import { useContextStore } from '@/store/context';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Target, AlertTriangle, Lightbulb, Plus, Cloud, Bot, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAwsAccounts, getAllAwsAccountsCosts, type AccountCost } from '@/lib/api/aws';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/** 최소한의 로컬 타입 (API 타입이 있으면 그걸 import 해도 됨) */
type CostPoint = { amount: number };
type Budget = { amount: number; spendToDate?: number };
type Anomaly = { date: string | Date };
type Recommendation = { saving: number };

export function Dashboard() {
  const { tenantId, from, to, currency } = useContextStore();
  const router = useRouter();

  const { data: costSeriesRaw } = useCostSeries({ tenantId, from, to });
  const { data: budgetsRaw } = useBudgets(tenantId);
  const { data: anomaliesRaw } = useAnomalies(tenantId);
  const { data: recommendationsRaw } = useRecommendations(tenantId);
  
  // AWS 계정 목록 조회
  const { data: awsAccounts } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
  });
  
  const hasCloudAccounts = (awsAccounts?.length ?? 0) > 0;

  // 최근 30일 날짜 계산
  const endDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Cost Explorer는 endDate를 exclusive로 처리
    return date.toISOString().split('T')[0];
  }, []);
  
  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }, []);
  
  // AWS 계정별 비용 조회 (최근 30일)
  const { data: awsAccountCosts, isLoading: isLoadingCosts } = useQuery({
    queryKey: ['awsAccountCosts', startDate, endDate],
    queryFn: () => getAllAwsAccountsCosts(startDate, endDate),
    enabled: hasCloudAccounts,
  });

  // AWS 계정별 총 비용 계산
  const totalAwsCost = useMemo(() => {
    if (!awsAccountCosts) return 0;
    return awsAccountCosts.reduce((sum, account) => sum + account.totalCost, 0);
  }, [awsAccountCosts]);

  // 안전한 기본값 + 좁은 타입 보장
  const costSeries = (costSeriesRaw ?? []) as CostPoint[];
  const budgets = (budgetsRaw ?? []) as Budget[];
  const anomalies = (anomaliesRaw ?? []) as Anomaly[];
  const recommendations = (recommendationsRaw ?? []) as Recommendation[];

  const currentMonthCost = costSeries.at(-1)?.amount ?? 0;
  const previousMonthCost = costSeries.at(-2)?.amount ?? 0;
  const costChange =
    previousMonthCost > 0 ? ((currentMonthCost - previousMonthCost) / previousMonthCost) * 100 : 0;

  const totalBudget = budgets.reduce(
    (sum: number, b: Budget) => sum + (b.amount ?? 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum: number, b: Budget) => sum + (b.spendToDate ?? 0),
    0
  );

  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentAnomalies = anomalies.filter((a: Anomaly) => {
    const d = typeof a.date === 'string' ? new Date(a.date).getTime() : new Date(a.date).getTime();
    return d >= oneWeekAgo;
  }).length;

  const totalSavings = recommendations.reduce(
    (sum: number, r: Recommendation) => sum + (r.saving ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="text-gray-600 mt-2">클라우드 비용 현황을 한눈에 확인하세요</p>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="이번 달 총 비용"
          value={formatCurrency(currentMonthCost, currency)}
          change={{
            value: costChange,
            label: '전월 대비',
          }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="예산 소진률"
          value={`${budgetUtilization.toFixed(1)}%`}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          title="이상징후 (7일)"
          value={recentAnomalies}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="예상 절감액"
          value={formatCurrency(totalSavings, currency)}
          icon={<Lightbulb className="h-4 w-4" />}
        />
      </div>

      {/* 빠른 작업 */}
      <Card className={`shadow-lg border-0 bg-white ${!hasCloudAccounts ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">빠른 작업</CardTitle>
          <CardDescription className="text-gray-600">
            자주 사용하는 기능에 빠르게 접근하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasCloudAccounts && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  클라우드 계정을 먼저 연결하세요
                </p>
                <p className="text-sm text-blue-700">
                  비용 분석과 예산 관리를 시작하려면 클라우드 계정 연결이 필요합니다.
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            <Button
              variant={!hasCloudAccounts ? "default" : "outline"}
              className={
                !hasCloudAccounts
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg animate-pulse"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }
              onClick={() => router.push('/mypage?addCloudAccount=1')}
            >
              <Cloud className="mr-2 h-4 w-4" />
              계정 연결
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              예산 만들기
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

      {/* AWS 계정별 비용 */}
      {hasCloudAccounts && (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">AWS 계정별 비용</CardTitle>
            <CardDescription className="text-gray-600">
              연결된 AWS 계정의 비용을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCosts ? (
              <div className="text-center py-8 text-gray-600">비용 데이터를 불러오는 중...</div>
            ) : awsAccountCosts && awsAccountCosts.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {awsAccountCosts.map((account: AccountCost) => (
                    <div
                      key={account.accountId}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                        <Cloud className="h-5 w-5 text-orange-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(account.totalCost, currency)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">최근 30일 비용</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">총 AWS 비용</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(totalAwsCost, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                비용 데이터가 없습니다. AWS Cost Explorer가 활성화되어 있는지 확인하세요.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

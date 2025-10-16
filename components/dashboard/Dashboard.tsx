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
import { DollarSign, Target, AlertTriangle, Lightbulb, Plus, Cloud, Bot } from 'lucide-react';

/** 최소한의 로컬 타입 (API 타입이 있으면 그걸 import 해도 됨) */
type CostPoint = { amount: number };
type Budget = { amount: number; spendToDate?: number };
type Anomaly = { date: string | Date };
type Recommendation = { saving: number };

export function Dashboard() {
  const { tenantId, from, to, currency } = useContextStore();

  const { data: costSeriesRaw } = useCostSeries({ tenantId, from, to });
  const { data: budgetsRaw } = useBudgets(tenantId);
  const { data: anomaliesRaw } = useAnomalies(tenantId);
  const { data: recommendationsRaw } = useRecommendations(tenantId);

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
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">빠른 작업</CardTitle>
          <CardDescription className="text-gray-600">
            자주 사용하는 기능에 빠르게 접근하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
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
    </div>
  );
}

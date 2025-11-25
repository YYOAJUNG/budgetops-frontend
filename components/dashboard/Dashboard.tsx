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
import { useUIStore } from '@/store/ui';
import { formatCurrency, convertCurrency, cn } from '@/lib/utils';
import { DollarSign, Target, Lightbulb, Cloud, Bot, AlertCircle, Gift, X, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAwsAccounts, getAllAwsAccountsCosts, type AccountCost } from '@/lib/api/aws';
import { getGcpAccounts } from '@/lib/api/gcp';
import { getAzureAccounts, getAllAzureAccountsCosts, type AzureAccountCost } from '@/lib/api/azure';
import { getNcpAccounts, getAllNcpAccountsCostsSummary } from '@/lib/api/ncp';
import { getBudgetUsage } from '@/lib/api/budget';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/** 최소한의 로컬 타입 (API 타입이 있으면 그걸 import 해도 됨) */
type CostPoint = { amount: number };
type Budget = { amount: number; spendToDate?: number };
type Recommendation = { saving: number };

export function Dashboard() {
  const { tenantId, from, to, currency } = useContextStore();
  const router = useRouter();
  const { toggleAIChat } = useUIStore();
  const [showFreeTierDialog, setShowFreeTierDialog] = useState(false);

  const { data: costSeriesRaw } = useCostSeries({ tenantId, from, to });
  const { data: budgetsRaw } = useBudgets(tenantId);
  const { data: recommendationsRaw } = useRecommendations(tenantId);
  const { data: budgetUsage } = useQuery({
    queryKey: ['budgetUsage'],
    queryFn: getBudgetUsage,
  });
  
  // AWS 계정 목록 조회
  const { data: awsAccounts } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
  });
  
  // GCP 계정 목록 조회
  const { data: gcpAccounts } = useQuery({
    queryKey: ['gcpAccounts'],
    queryFn: getGcpAccounts,
  });
  
  // Azure 계정 목록 조회
  const { data: azureAccounts } = useQuery({
    queryKey: ['azureAccounts'],
    queryFn: getAzureAccounts,
  });

  // NCP 계정 목록 조회
  const { data: ncpAccounts } = useQuery({
    queryKey: ['ncpAccounts'],
    queryFn: getNcpAccounts,
  });

  const hasCloudAccounts = (awsAccounts?.length ?? 0) > 0 || (gcpAccounts?.length ?? 0) > 0 || (azureAccounts?.length ?? 0) > 0 || (ncpAccounts?.length ?? 0) > 0;

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
  const { data: awsAccountCosts, isLoading: isLoadingCosts, error: costsError } = useQuery({
    queryKey: ['awsAccountCosts', startDate, endDate],
    queryFn: () => getAllAwsAccountsCosts(startDate, endDate),
    enabled: hasCloudAccounts,
    retry: 1, // 실패 시 1번만 재시도
  });

  // AWS 계정별 총 비용 계산 (USD 기준)
  const totalAwsCostUsd = useMemo(() => {
    if (!awsAccountCosts) return 0;
    return awsAccountCosts.reduce((sum, account) => sum + account.totalCost, 0);
  }, [awsAccountCosts]);

  // GCP 계정별 비용 조회
  // TODO: GCP 비용 API 구현 필요
  // - lib/api/gcp.ts에 getAllGcpAccountsCosts 함수 추가 필요
  // - API 엔드포인트: GET /gcp/accounts/costs?startDate={startDate}&endDate={endDate}
  // - 반환 타입: Array<{ accountId: number; accountName: string; totalCost: number }>
  // - 현재는 API가 없으므로 0으로 처리
  const gcpAccountCosts: Array<{ accountId: number; accountName: string; totalCost: number }> = useMemo(() => {
    if (!gcpAccounts || gcpAccounts.length === 0) return [];
    return gcpAccounts.map(account => ({
      accountId: account.id,
      accountName: account.name || account.projectId || `GCP Account ${account.id}`,
      totalCost: 0, // TODO: GCP 비용 API 구현 후 실제 비용 데이터로 교체
    }));
  }, [gcpAccounts]);

  const totalGcpCostUsd = useMemo(() => {
    return gcpAccountCosts.reduce((sum, account) => sum + account.totalCost, 0);
  }, [gcpAccountCosts]);

  // NCP 계정별 비용 조회 (이번 달)
  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }, []);

  const { data: ncpAccountCosts, isLoading: isLoadingNcpCosts, error: ncpCostsError } = useQuery({
    queryKey: ['ncpAccountCosts', currentMonth],
    queryFn: () => getAllNcpAccountsCostsSummary(currentMonth),
    enabled: (ncpAccounts?.length ?? 0) > 0,
    retry: 1,
  });

  // NCP 계정별 총 비용 계산 (KRW 기준)
  const totalNcpCost = useMemo(() => {
    if (!ncpAccountCosts) return { amount: 0, currency: 'KRW' };

    const totalAmount = ncpAccountCosts.reduce((sum, account) => sum + account.totalCost, 0);
    // NCP는 모든 계정이 KRW 통화를 사용
    return { amount: totalAmount, currency: 'KRW' };
  }, [ncpAccountCosts]);

  // Azure 계정별 비용 조회 (최근 30일)
  const { data: azureAccountCosts, isLoading: isLoadingAzureCosts, error: azureCostsError } = useQuery({
    queryKey: ['azureAccountCosts', startDate, endDate],
    queryFn: () => getAllAzureAccountsCosts(startDate, endDate),
    enabled: (azureAccounts?.length ?? 0) > 0,
    retry: 1,
  });

  // Azure 계정별 총 비용 계산 (원래 통화 기준으로 합산, 이후 변환)
  const totalAzureCost = useMemo(() => {
    if (!azureAccountCosts) return { amount: 0, currency: 'USD' };
    // 모든 계정의 통화가 같은지 확인 (일반적으로는 같을 것)
    const currencies = new Set(azureAccountCosts.map(acc => acc.currency || 'USD'));
    const primaryCurrency = currencies.size === 1 ? Array.from(currencies)[0] : 'USD';
    
    // 같은 통화로 합산
    const totalAmount = azureAccountCosts.reduce((sum, account) => {
      const accountCurrency = account.currency || 'USD';
      if (accountCurrency === primaryCurrency) {
        return sum + account.amount;
      } else {
        // 통화가 다르면 USD로 변환 후 합산
        const amountInUsd = accountCurrency === 'KRW' 
          ? convertCurrency(account.amount, 'KRW', 'USD')
          : account.amount; // USD로 가정
        return sum + amountInUsd;
      }
    }, 0);
    
    return { amount: totalAmount, currency: primaryCurrency };
  }, [azureAccountCosts]);

  // 안전한 기본값 + 좁은 타입 보장
  const costSeries = (costSeriesRaw ?? []) as CostPoint[];
  const budgets = (budgetsRaw ?? []) as Budget[];
  const recommendations = (recommendationsRaw ?? []) as Recommendation[];
  
  // AWS 계정별 상세 비용 조회 (프리티어 정보 포함)
  const { data: awsAccountDetailedCosts } = useQuery({
    queryKey: ['awsAccountDetailedCosts', startDate, endDate],
    queryFn: async () => {
      if (!awsAccounts || awsAccounts.length === 0) return [];
      
      const { getAwsAccountCosts } = await import('@/lib/api/aws');
      const costsPromises = awsAccounts
        .filter(acc => acc.active)
        .map(async (account) => {
          const costs = await getAwsAccountCosts(account.id, startDate, endDate);
          return { accountId: account.id, accountName: account.name, costs };
        });
      
      return await Promise.all(costsPromises);
    },
    enabled: (awsAccounts?.length ?? 0) > 0,
  });
  
  // 계정별 프리티어 사용 현황 계산
  const accountFreeTierUsage = useMemo(() => {
    if (!awsAccountDetailedCosts || awsAccountDetailedCosts.length === 0) {
      return [];
    }
    
    const accountUsageList: Array<{ 
      name: string; 
      usage: number; 
      limit: number; 
      percentage: number;
      isExhausted: boolean;
    }> = [];
    
    // 각 계정별로 프리티어 정보 수집
    awsAccountDetailedCosts.forEach(({ accountId, accountName, costs }) => {
      // 서비스별로 최대 사용량과 한도를 추적 (프리티어는 보통 월별 한도이므로)
      const serviceUsageMap: Record<string, { usage: number; limit: number }> = {};
      
      costs.forEach(dailyCost => {
        dailyCost.services.forEach(service => {
          if (service.freeTierInfo && service.freeTierInfo.isFreeTierActive) {
            const serviceKey = service.service;
            if (!serviceUsageMap[serviceKey]) {
              serviceUsageMap[serviceKey] = {
                usage: 0,
                limit: service.freeTierInfo.freeTierLimit,
              };
            }
            // 각 서비스별로 최대 사용량 추적 (일별 데이터 중 최대값 사용)
            serviceUsageMap[serviceKey].usage = Math.max(
              serviceUsageMap[serviceKey].usage,
              service.freeTierInfo.usage
            );
            // 한도는 동일하므로 한 번만 설정
            if (serviceUsageMap[serviceKey].limit === 0 && service.freeTierInfo.freeTierLimit > 0) {
              serviceUsageMap[serviceKey].limit = service.freeTierInfo.freeTierLimit;
            }
          }
        });
      });
      
      // 서비스별 사용량과 한도를 합산
      let totalUsage = 0;
      let totalLimit = 0;
      
      Object.values(serviceUsageMap).forEach(({ usage, limit }) => {
        totalUsage += usage;
        totalLimit += limit;
      });
      
      if (totalLimit > 0) {
        const percentage = Math.min((totalUsage / totalLimit) * 100, 100);
        const isExhausted = totalUsage >= totalLimit;
        
        accountUsageList.push({
          name: accountName,
          usage: totalUsage,
          limit: totalLimit,
          percentage,
          isExhausted,
        });
      }
    });
    
    return accountUsageList;
  }, [awsAccountDetailedCosts]);
  
  // 전체 프리티어 사용 현황 계산 (모든 AWS 계정의 퍼센테이지 평균)
  const freeTierUsage = useMemo(() => {
    if (!awsAccounts || awsAccounts.length === 0) {
      return { totalUsage: 0, totalLimit: 0, percentage: 0, isActive: false };
    }
    
    // 활성 계정만 필터링
    const activeAccounts = awsAccounts.filter(acc => acc.active);
    if (activeAccounts.length === 0) {
      return { totalUsage: 0, totalLimit: 0, percentage: 0, isActive: false };
    }
    
    // 각 계정의 프리티어 사용률 계산
    const accountPercentages: number[] = [];
    
    activeAccounts.forEach(account => {
      const accountUsage = accountFreeTierUsage.find(acc => acc.name === account.name);
      if (accountUsage) {
        // 프리티어 정보가 있는 계정: 실제 사용률 사용
        accountPercentages.push(accountUsage.percentage);
      } else {
        // 프리티어 정보가 없는 계정 (비용이 발생한 경우): 100%로 처리
        const accountCost = awsAccountCosts?.find(acc => acc.accountId === account.id);
        if (accountCost && accountCost.totalCost > 0) {
          accountPercentages.push(100);
        } else {
          // 비용도 없고 프리티어 정보도 없는 경우: 0%로 처리
          accountPercentages.push(0);
        }
      }
    });
    
    // 모든 계정의 퍼센테이지 평균 계산
    const averagePercentage = accountPercentages.length > 0
      ? accountPercentages.reduce((sum, pct) => sum + pct, 0) / accountPercentages.length
      : 0;
    
    // 전체 사용량과 한도도 계산 (표시용)
    const totalUsage = accountFreeTierUsage.reduce((sum, acc) => sum + acc.usage, 0);
    const totalLimit = accountFreeTierUsage.reduce((sum, acc) => sum + acc.limit, 0);
    
    return {
      totalUsage,
      totalLimit,
      percentage: Math.min(averagePercentage, 100),
      isActive: accountFreeTierUsage.length > 0 || (awsAccountCosts?.some(acc => acc.totalCost > 0) ?? false),
    };
  }, [accountFreeTierUsage, awsAccounts, awsAccountCosts]);

  const currentMonthCost = costSeries.at(-1)?.amount ?? 0;
  const previousMonthCost = costSeries.at(-2)?.amount ?? 0;
  const costChange =
    previousMonthCost > 0 ? ((currentMonthCost - previousMonthCost) / previousMonthCost) * 100 : 0;

  // 이번 달 총 비용에 AWS, Azure, NCP 비용도 포함 (통화 변환 적용)
  const totalCurrentMonthCost = useMemo(() => {
    if (budgetUsage) {
      const sourceCurrency = (budgetUsage.currency ?? 'KRW') as 'KRW' | 'USD';
      return convertCurrency(budgetUsage.currentMonthCost ?? 0, sourceCurrency, currency);
    }
    // AWS 비용은 USD로 반환되므로, 선택된 currency에 맞게 변환
    const convertedAwsCost = convertCurrency(totalAwsCostUsd, 'USD', currency);
    // Azure 비용은 원래 통화에서 선택된 currency로 변환
    const convertedAzureCost = convertCurrency(totalAzureCost.amount, totalAzureCost.currency as 'KRW' | 'USD', currency);
    // NCP 비용은 원래 통화에서 선택된 currency로 변환
    const convertedNcpCost = convertCurrency(totalNcpCost.amount, totalNcpCost.currency as 'KRW' | 'USD', currency);
    // costSeries의 비용과 변환된 AWS, Azure, NCP 비용을 합산
    return currentMonthCost + convertedAwsCost + convertedAzureCost + convertedNcpCost;
  }, [budgetUsage, currentMonthCost, totalAwsCostUsd, totalAzureCost, totalNcpCost, currency]);

  const totalBudget = budgets.reduce(
    (sum: number, b: Budget) => sum + (b.amount ?? 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum: number, b: Budget) => sum + (b.spendToDate ?? 0),
    0
  );

  const fallbackBudgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const budgetUtilization = budgetUsage?.usagePercentage ?? fallbackBudgetUtilization;

  const totalSavings = recommendations.reduce(
    (sum: number, r: Recommendation) => sum + (r.saving ?? 0),
    0
  );

  const budgetAdditionalInfo = useMemo(() => {
    if (!budgetUsage || (budgetUsage.monthlyBudgetLimit ?? 0) <= 0) {
      return <p className="text-xs text-gray-500">예산을 설정해 주세요.</p>;
    }
    const sourceCurrency = (budgetUsage.currency ?? 'KRW') as 'KRW' | 'USD';
    const currentCostDisplay = formatCurrency(
      convertCurrency(budgetUsage.currentMonthCost ?? 0, sourceCurrency, currency),
      currency
    );
    const budgetDisplay = formatCurrency(
      convertCurrency(budgetUsage.monthlyBudgetLimit ?? 0, 'KRW', currency),
      currency
    );
    return (
      <>
        <p className="text-xs text-gray-500">이번 달 비용 {currentCostDisplay}</p>
        <p className="text-xs text-gray-500">
          설정 예산 {budgetDisplay} · 임계값 {budgetUsage.alertThreshold ?? 0}%
        </p>
      </>
    );
  }, [budgetUsage, currency]);

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
          value={formatCurrency(totalCurrentMonthCost, currency)}
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
          additionalInfo={budgetAdditionalInfo}
        />
        <StatCard
          title="프리티어 사용률"
          value={freeTierUsage.isActive ? `${freeTierUsage.percentage.toFixed(1)}%` : '0%'}
          icon={<Gift className="h-4 w-4" />}
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
          <CardDescription className="text-gray-600">자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className={cn(
                "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
                !hasCloudAccounts && "relative border-blue-500 bg-blue-50 text-blue-700 shadow-lg animate-pulse"
              )}
              onClick={() => router.push('/mypage?addCloudAccount=1')}
            >
              <Cloud className="mr-2 h-4 w-4" />
              계정 연결
              {!hasCloudAccounts && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              onClick={toggleAIChat}
            >
              <Bot className="mr-2 h-4 w-4" />
              코파일럿 열기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSP별 비용 카드 */}
      {hasCloudAccounts && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">클라우드 서비스별 비용</h3>
            <p className="text-sm text-gray-600">최근 30일간의 비용을 확인하세요</p>
            <p className="text-xs text-gray-500 mt-1">※ 프리티어 소진은 별도로 표시되지 않습니다</p>
          </div>
          
          {(isLoadingCosts || isLoadingAzureCosts || isLoadingNcpCosts) ? (
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="py-8">
                <div className="text-center text-gray-600">비용 데이터를 불러오는 중...</div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* AWS 계정 비용 카드 */}
              {awsAccounts && awsAccounts.length > 0 && (
                costsError ? (
            <Card className="shadow-lg border-0 bg-white border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                          <h4 className="text-sm font-semibold text-red-900 mb-1">AWS 비용 데이터 조회 실패</h4>
                    <p className="text-sm text-red-700">
                      {costsError instanceof Error ? costsError.message : '비용 데이터를 불러오는 중 오류가 발생했습니다.'}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      AWS Cost Explorer 권한이 활성화되어 있는지 확인하세요.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : awsAccountCosts && awsAccountCosts.length > 0 ? (
            totalAwsCostUsd > 0 ? (
              <Card className="shadow-lg border-0 bg-white border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Cloud className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">AWS</h4>
                        <p className="text-sm text-gray-600">{awsAccountCosts.length}개 계정</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">총 비용</p>
                      <p className="text-2xl font-bold text-orange-600">
                              {freeTierUsage.isActive && totalAwsCostUsd === 0 ? (
                                <span className="flex items-center gap-2 justify-end">
                                  <Gift className="h-5 w-5 text-green-600" />
                                  <span className="text-green-600">프리티어 사용 중</span>
                                </span>
                              ) : (
                                formatCurrency(convertCurrency(totalAwsCostUsd, 'USD', currency), currency)
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {(awsAccountCosts.length > 1 || (awsAccountCosts.length === 1 && accountFreeTierUsage.length > 0)) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid gap-3 sm:grid-cols-2">
                              {awsAccountCosts.map((account: AccountCost) => {
                                // 해당 계정의 프리티어 정보 확인
                                const accountData = awsAccountDetailedCosts?.find(
                                  data => data.accountId === account.accountId
                                );
                                
                                const hasFreeTier = accountData?.costs.some(dc =>
                                  dc.services.some(s => s.freeTierInfo?.isFreeTierActive)
                                ) ?? false;
                                
                                const accountUsage = accountFreeTierUsage.find(acc => 
                                  acc.name === account.accountName
                                );
                                
                                return (
                                  <div
                                    key={account.accountId}
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                  >
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      {account.accountName}
                                    </p>
                                    {account.totalCost === 0 ? (
                                      hasFreeTier && accountUsage ? (
                                        <div>
                                          <p className="text-xs text-gray-600">
                                            {account.accountName} / {accountUsage.isExhausted 
                                              ? "프리티어 소진" 
                                              : `${accountUsage.percentage.toFixed(1)}%`
                                            }
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-lg font-bold text-gray-900">
                                          {formatCurrency(0, currency)}
                                        </p>
                                      )
                                    ) : (
                                      <div>
                                        <p className="text-lg font-bold text-gray-900">
                                          {formatCurrency(convertCurrency(account.totalCost, 'USD', currency), currency)}
                                        </p>
                                        {accountUsage && (
                                          <p className="text-xs text-gray-600 mt-1">
                                            {account.accountName} / {accountUsage.percentage.toFixed(1)}%
                                          </p>
                                        )}
                                        {!accountUsage && (
                                          <p className="text-xs text-gray-600 mt-1">
                                            {account.accountName} / 100%
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-lg border-0 bg-white border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Cloud className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">AWS</h4>
                              <p className="text-sm text-gray-600">{awsAccountCosts.length}개 계정</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">총 비용</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {freeTierUsage.isActive ? (
                                <span className="flex items-center gap-2">
                                  <Gift className="h-5 w-5 text-green-600" />
                                  <span className="text-green-600">프리티어 사용 중</span>
                                </span>
                              ) : (
                                formatCurrency(0, currency)
                              )}
                            </p>
                          </div>
                        </div>
                        {freeTierUsage.isActive ? (
                          <div className="mt-3 space-y-2">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs text-green-800 font-medium mb-1">
                                프리티어 범위 내 사용 중
                              </p>
                              <p className="text-xs text-green-700">
                                사용률: {freeTierUsage.percentage.toFixed(1)}% ({freeTierUsage.totalUsage.toFixed(0)}/{freeTierUsage.totalLimit.toFixed(0)})
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                              onClick={() => setShowFreeTierDialog(true)}
                            >
                              프리티어 자세히 보기
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 mt-3">
                            최근 30일간 비용이 발생하지 않았습니다.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card className="shadow-lg border-0 bg-white border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-yellow-900 mb-1">AWS 비용 데이터 없음</h4>
                          <p className="text-sm text-yellow-700">
                            최근 30일간의 비용 데이터가 없습니다. 다음을 확인하세요:
                          </p>
                          <ul className="text-xs text-yellow-600 mt-2 list-disc list-inside space-y-1">
                            <li>AWS Cost Explorer가 활성화되어 있는지 확인</li>
                            <li>IAM 권한에 <code className="bg-yellow-50 px-1 rounded">ce:GetCostAndUsage</code> 권한이 있는지 확인</li>
                            <li>비용이 발생한 리소스가 있는지 확인</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              {/* GCP 계정 비용 카드 */}
              {gcpAccounts && gcpAccounts.length > 0 && (
                <Card className="shadow-lg border-0 bg-white border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Cloud className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">GCP</h4>
                          <p className="text-sm text-gray-600">{gcpAccounts.length}개 계정</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">총 비용</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(convertCurrency(totalGcpCostUsd, 'USD', currency), currency)}
                      </p>
                    </div>
                  </div>
                  
                    {gcpAccountCosts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {gcpAccountCosts.map((account) => (
                          <div
                            key={account.accountId}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              {account.accountName}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(convertCurrency(account.totalCost, 'USD', currency), currency)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </CardContent>
                </Card>
              )}

              {/* Azure 계정 비용 카드 */}
              {azureAccounts && azureAccounts.length > 0 && (
                azureCostsError ? (
                  <Card className="shadow-lg border-0 bg-white border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-red-900 mb-1">Azure 비용 데이터 조회 실패</h4>
                          <p className="text-sm text-red-700">
                            {azureCostsError instanceof Error ? azureCostsError.message : '비용 데이터를 불러오는 중 오류가 발생했습니다.'}
                          </p>
                          <p className="text-xs text-red-600 mt-2">
                            Azure Cost Management 권한이 활성화되어 있는지 확인하세요.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : azureAccountCosts && azureAccountCosts.length > 0 ? (
                  totalAzureCost.amount > 0 ? (
                    <Card className="shadow-lg border-0 bg-white border-l-4 border-l-sky-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-100 rounded-lg">
                              <Cloud className="h-6 w-6 text-sky-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">Azure</h4>
                              <p className="text-sm text-gray-600">{azureAccountCosts.length}개 계정</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">총 비용</p>
                            <p className="text-2xl font-bold text-sky-600">
                              {formatCurrency(convertCurrency(totalAzureCost.amount, totalAzureCost.currency as 'KRW' | 'USD', currency), currency)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {azureAccountCosts.map((account: AzureAccountCost) => (
                              <div
                                key={account.accountId}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {account.accountName}
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatCurrency(convertCurrency(account.amount, (account.currency || 'USD') as 'KRW' | 'USD', currency), currency)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                </CardContent>
              </Card>
            ) : (
                    <Card className="shadow-lg border-0 bg-white border-l-4 border-l-sky-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-100 rounded-lg">
                              <Cloud className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                              <h4 className="text-lg font-semibold text-gray-900">Azure</h4>
                              <p className="text-sm text-gray-600">{azureAccountCosts.length}개 계정</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">총 비용</p>
                            <p className="text-2xl font-bold text-sky-600">
                        {formatCurrency(0, currency)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    최근 30일간 비용이 발생하지 않았습니다.
                  </p>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {azureAccountCosts.map((account: AzureAccountCost) => (
                              <div
                                key={account.accountId}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {account.accountName}
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatCurrency(convertCurrency(account.amount, (account.currency || 'USD') as 'KRW' | 'USD', currency), currency)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                </CardContent>
              </Card>
            )
                ) : (
            <Card className="shadow-lg border-0 bg-white border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                          <h4 className="text-sm font-semibold text-yellow-900 mb-1">Azure 비용 데이터 없음</h4>
                    <p className="text-sm text-yellow-700">
                      최근 30일간의 비용 데이터가 없습니다. 다음을 확인하세요:
                    </p>
                    <ul className="text-xs text-yellow-600 mt-2 list-disc list-inside space-y-1">
                            <li>Azure Cost Management가 활성화되어 있는지 확인</li>
                            <li>서비스 프린시펄에 Cost Management Reader 권한이 있는지 확인</li>
                      <li>비용이 발생한 리소스가 있는지 확인</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
                )
              )}

              {/* NCP 계정 비용 카드 */}
              {ncpAccounts && ncpAccounts.length > 0 && (
                ncpCostsError ? (
                  <Card className="shadow-lg border-0 bg-white border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-red-900 mb-1">NCP 비용 데이터 조회 실패</h4>
                          <p className="text-sm text-red-700">
                            {ncpCostsError instanceof Error ? ncpCostsError.message : '비용 데이터를 불러오는 중 오류가 발생했습니다.'}
                          </p>
                          <p className="text-xs text-red-600 mt-2">
                            NCP API 키 권한이 활성화되어 있는지 확인하세요.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : ncpAccountCosts && ncpAccountCosts.length > 0 ? (
                  totalNcpCost.amount > 0 ? (
                    <Card className="shadow-lg border-0 bg-white border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Cloud className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">NCP</h4>
                              <p className="text-sm text-gray-600">{ncpAccountCosts.length}개 계정</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">총 비용</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(convertCurrency(totalNcpCost.amount, totalNcpCost.currency as 'KRW' | 'USD', currency), currency)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {ncpAccountCosts.map((account) => (
                              <div
                                key={account.accountId}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {account.accountName}
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatCurrency(convertCurrency(account.totalCost, (account.currency || 'KRW') as 'KRW' | 'USD', currency), currency)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-lg border-0 bg-white border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Cloud className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">NCP</h4>
                              <p className="text-sm text-gray-600">{ncpAccountCosts.length}개 계정</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">총 비용</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(0, currency)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          이번 달 비용이 발생하지 않았습니다.
                        </p>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card className="shadow-lg border-0 bg-white border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-yellow-900 mb-1">NCP 비용 데이터 없음</h4>
                          <p className="text-sm text-yellow-700">
                            이번 달 비용 데이터가 없습니다. 다음을 확인하세요:
                          </p>
                          <ul className="text-xs text-yellow-600 mt-2 list-disc list-inside space-y-1">
                            <li>NCP 계정이 정상적으로 연결되어 있는지 확인</li>
                            <li>API 키 권한이 올바르게 설정되어 있는지 확인</li>
                            <li>비용이 발생한 리소스가 있는지 확인</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              {/* 계정이 없는 경우 */}
              {(!awsAccounts || awsAccounts.length === 0) && (!gcpAccounts || gcpAccounts.length === 0) && (!azureAccounts || azureAccounts.length === 0) && (!ncpAccounts || ncpAccounts.length === 0) && (
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="py-8">
                <div className="text-center text-gray-600">
                      연결된 클라우드 계정이 없습니다.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
        </div>
      )}

      {/* 프리티어 상세 정보 다이얼로그 */}
      <Dialog open={showFreeTierDialog} onOpenChange={setShowFreeTierDialog}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  프리티어 사용 현황
                </DialogTitle>
              </div>
              <button
                onClick={() => setShowFreeTierDialog(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {accountFreeTierUsage.length > 0 ? (
              <>
                {/* 전체 요약 */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-green-900">전체 사용률</span>
                    <span className="text-2xl font-bold text-green-700">
                      {freeTierUsage.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-green-200 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all shadow-sm"
                        style={{ width: `${Math.min(freeTierUsage.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-green-700 font-medium">
                        {freeTierUsage.totalUsage.toFixed(0)} / {freeTierUsage.totalLimit.toFixed(0)} 사용
                      </p>
                      <p className="text-xs text-green-600">
                        잔여: {(freeTierUsage.totalLimit - freeTierUsage.totalUsage).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 계정별 상세 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gray-500" />
                    계정별 사용률
                  </h3>
                  <div className="space-y-3">
                    {accountFreeTierUsage.map((account, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "p-4 rounded-lg border hover:shadow-sm transition-all",
                          account.isExhausted 
                            ? "bg-red-50 border-red-200 hover:border-red-300" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-900">{account.name}</span>
                          <span className={cn(
                            "text-base font-semibold",
                            account.isExhausted ? "text-red-600" : "text-gray-700"
                          )}>
                            {account.isExhausted ? "프리티어 소진" : `${account.percentage.toFixed(1)}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all",
                              account.isExhausted 
                                ? "bg-gradient-to-r from-red-400 to-red-500" 
                                : "bg-gradient-to-r from-blue-400 to-blue-500"
                            )}
                            style={{ width: `${Math.min(account.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-xs",
                            account.isExhausted ? "text-red-700" : "text-gray-600"
                          )}>
                            {account.usage.toFixed(0)} / {account.limit.toFixed(0)} 사용
                          </p>
                          <p className={cn(
                            "text-xs",
                            account.isExhausted ? "text-red-600" : "text-gray-500"
                          )}>
                            {account.isExhausted 
                              ? "초과: " + (account.usage - account.limit).toFixed(0)
                              : "잔여: " + (account.limit - account.usage).toFixed(0)
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Gift className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">프리티어 사용 정보가 없습니다.</p>
                <p className="text-xs text-gray-400 mt-1">프리티어 대상 리소스를 사용하면 여기에 표시됩니다.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

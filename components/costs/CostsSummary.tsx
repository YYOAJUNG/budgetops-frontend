'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/layout/DateRangePicker';
import { useQuery } from '@tanstack/react-query';
import { useContextStore } from '@/store/context';
import { formatCurrency, formatCurrencyCompact, formatPercent, convertCurrency } from '@/lib/utils';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { getAwsAccounts, getAwsAccountCosts } from '@/lib/api/aws';
import { getGcpAccounts } from '@/lib/api/gcp';
import { getAzureAccounts, getAllAzureAccountsCosts, type AzureAccountCost } from '@/lib/api/azure';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type ProviderAccount = {
  name: string;
  amount: number;
  isFreeTierActive?: boolean;
};

type ProviderCost = {
  provider: string;
  amount: number;
  accounts: ProviderAccount[];
  previousAmount?: number;
};

type CostsResponse = {
  total: number;
  providers: ProviderCost[];
  byService: Array<{ service: string; amount: number }>;
  previousPeriod?: {
    total: number;
    providers: ProviderCost[];
    byService: Array<{ service: string; amount: number }>;
  };
};

/**
 * 실제 비용 데이터 조회
 */
async function fetchCosts(from: string, to: string, currency: 'KRW' | 'USD'): Promise<CostsResponse> {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const periodDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousFromDate = new Date(fromDate);
  previousFromDate.setDate(previousFromDate.getDate() - periodDays);
  const previousToDate = new Date(fromDate);
  const previousFrom = previousFromDate.toISOString().split('T')[0];
  const previousTo = previousToDate.toISOString().split('T')[0];

  // AWS 비용
  const awsAccounts = await getAwsAccounts().catch(() => []);
  const activeAwsAccounts = awsAccounts.filter((acc) => acc.active);
  const awsAccountTotals: Record<number, number> = {};
  const awsServiceCosts: Record<string, number> = {};
  let awsTotalCost = 0;
  let previousAwsTotalCost = 0;

  // 프리티어 정보 수집
  const freeTierInfoMap: Record<number, { hasFreeTier: boolean; services: string[] }> = {};
  
  for (const account of activeAwsAccounts) {
    try {
      const dailyCosts = await getAwsAccountCosts(account.id, from, to).catch(() => []);
      const accountTotal = dailyCosts.reduce((sum, day) => sum + day.totalCost, 0);
      awsAccountTotals[account.id] = accountTotal;
      awsTotalCost += accountTotal;

      // 프리티어 정보 확인
      const freeTierServices: string[] = [];
      dailyCosts.forEach((day) => {
        day.services.forEach((service) => {
          const costInCurrency = convertCurrency(service.cost, 'USD', currency);
          awsServiceCosts[service.service] = (awsServiceCosts[service.service] || 0) + costInCurrency;
          
          // 프리티어 사용 중인 서비스 확인
          if (service.freeTierInfo && service.freeTierInfo.isFreeTierActive && service.cost === 0) {
            if (!freeTierServices.includes(service.service)) {
              freeTierServices.push(service.service);
            }
          }
        });
      });
      
      if (freeTierServices.length > 0) {
        freeTierInfoMap[account.id] = { hasFreeTier: true, services: freeTierServices };
      }

      const previousDailyCosts = await getAwsAccountCosts(account.id, previousFrom, previousTo).catch(() => []);
      const previousAccountTotal = previousDailyCosts.reduce((sum, day) => sum + day.totalCost, 0);
      previousAwsTotalCost += previousAccountTotal;
    } catch (error) {
      console.error(`Failed to fetch costs for AWS account ${account.id}:`, error);
    }
  }

  // Azure 비용
  const azureAccounts = await getAzureAccounts().catch(() => []);
  const activeAzureAccounts = azureAccounts.filter((acc) => acc.active);
  let azureAccountTotals: AzureAccountCost[] = [];
  if (activeAzureAccounts.length > 0) {
    azureAccountTotals = await getAllAzureAccountsCosts(from, to).catch(() => []);
  }

  // GCP 비용 (미구현)
  const gcpAccounts = await getGcpAccounts().catch(() => []);
  const gcpTotalCost = 0;
  const previousGcpTotalCost = 0;

  const awsTotalInCurrency = convertCurrency(awsTotalCost, 'USD', currency);
  const previousAwsTotalInCurrency = convertCurrency(previousAwsTotalCost, 'USD', currency);
  const azureTotalInCurrency = azureAccountTotals.reduce(
    (sum, account) => sum + convertCurrency(account.amount, (account.currency || 'USD') as 'USD' | 'KRW', currency),
    0
  );

  const byService = Object.entries(awsServiceCosts)
    .map(([service, amount]) => ({ service, amount }))
    .sort((a, b) => b.amount - a.amount);

  const previousByService: Array<{ service: string; amount: number }> = [];

  const providers: ProviderCost[] = [];
  if (activeAwsAccounts.length > 0) {
    providers.push({
      provider: 'AWS',
      amount: awsTotalInCurrency,
      accounts: activeAwsAccounts.map((account) => {
        const accountTotal = awsAccountTotals[account.id] ?? 0;
        const freeTierInfo = freeTierInfoMap[account.id];
        return {
          name: account.name,
          amount: convertCurrency(accountTotal, 'USD', currency),
          isFreeTierActive: freeTierInfo?.hasFreeTier ?? false,
        };
      }),
      previousAmount: previousAwsTotalInCurrency,
    });
  }
  if (activeAzureAccounts.length > 0) {
    providers.push({
      provider: 'Azure',
      amount: azureTotalInCurrency,
      accounts: azureAccountTotals.map((account) => ({
        name: account.accountName,
        amount: convertCurrency(account.amount, (account.currency || 'USD') as 'USD' | 'KRW', currency),
      })),
    });
  }
  if (gcpAccounts.length > 0) {
    providers.push({
      provider: 'GCP',
      amount: gcpTotalCost,
      accounts: gcpAccounts.map((account) => ({ name: account.name || account.projectId, amount: 0 })),
      previousAmount: previousGcpTotalCost,
    });
  }

  const total = providers.reduce((sum, provider) => sum + provider.amount, 0);

  return {
    total,
    providers,
    byService,
    previousPeriod: previousAwsTotalInCurrency + previousGcpTotalCost > 0
      ? {
          total: previousAwsTotalInCurrency + previousGcpTotalCost,
          providers: providers.map((provider) => ({
            ...provider,
            amount: provider.previousAmount ?? 0,
            accounts: provider.accounts.map((account) => ({ ...account, amount: 0 })),
          })),
          byService: previousByService,
        }
      : undefined,
  };
}

// 서비스별 비용 막대 컴포넌트
function ServiceCostBar({
  service,
  amount,
  totalAmount,
  cumulativePercent,
  previousAmount,
  averageAmount,
  rank,
}: {
  service: string;
  amount: number;
  totalAmount: number;
  cumulativePercent: number;
  previousAmount?: number;
  averageAmount: number;
  rank: number;
}) {
  const percentage = (amount / Math.max(1, totalAmount)) * 100;
  const change = previousAmount ? ((amount - previousAmount) / Math.max(1, previousAmount)) * 100 : 0;
  const [showActionToast, setShowActionToast] = useState(false);

  // 액션 토스트 (예시)
  const actionToast = useMemo(() => {
    if (service === 'EC2') {
      return { text: '15% 다운사이즈 → -₩630K', action: 'rightsizing' };
    } else if (service === 'S3') {
      return { text: '50% 아카이브 → -₩?', action: 'storage' };
    }
    return null;
  }, [service]);

  return (
    <div className="relative group">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{service}</span>
            {rank <= 2 && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                {rank}위
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right flex-1">
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(amount)} ({percentage.toFixed(1)}%)
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              누적 {cumulativePercent.toFixed(1)}%
            </div>
            {previousAmount && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{formatPercent(Math.abs(change))}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 막대 그래프 */}
      <div className="relative h-6 rounded-full bg-gray-100 overflow-hidden">
        {/* 기준선 (평균) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 border-l border-dashed border-orange-400 z-10"
          style={{ left: `${(averageAmount / Math.max(1, totalAmount)) * 100}%` }}
        />

        {/* 전월 막대 (연한) */}
        {previousAmount && (
          <div
            className="absolute top-0 bottom-0 rounded-full bg-gray-300 opacity-30"
            style={{ width: `${Math.min(100, (previousAmount / Math.max(1, totalAmount)) * 100)}%` }}
          />
        )}

        {/* 현재 막대 */}
        <div
          className="absolute top-0 bottom-0 rounded-full bg-blue-500 relative z-20 group-hover:bg-blue-600 transition-colors"
          style={{ width: `${Math.min(100, percentage)}%` }}
        >
          {/* 증감 시그널 */}
          {previousAmount && change !== 0 && (
            <div
              className={`absolute ${change > 0 ? 'top-0' : 'bottom-0'} left-0 right-0 h-0.5 ${
                change > 0 ? 'bg-red-500' : 'bg-blue-500'
              }`}
            />
          )}
        </div>

        {/* 액션 토스트 (막대 우측 끝) */}
        {actionToast && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 z-30"
            style={{ left: `${Math.min(95, percentage + 1)}%` }}
            onMouseEnter={() => setShowActionToast(true)}
            onMouseLeave={() => setShowActionToast(false)}
          >
            <div className="px-2 py-0.5 bg-white border border-gray-300 rounded shadow-sm text-xs text-gray-700 whitespace-nowrap">
              {actionToast.text}
            </div>
          </div>
        )}
      </div>

      {/* 80% 컷 라인 표시 */}
      {cumulativePercent >= 80 && cumulativePercent - percentage < 80 && (
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-40" style={{ left: '80%' }}>
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-red-600 font-semibold whitespace-nowrap">
            80% 컷
          </div>
        </div>
      )}
    </div>
  );
}

export function CostsSummary() {
  const router = useRouter();
  const { from, to, currency } = useContextStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costsSummary', { from, to, currency }],
    queryFn: () => fetchCosts(from, to, currency),
  });

  const totalAmount = data?.total ?? 0;
  const providers = useMemo(() => data?.providers ?? [], [data]);
  const services = useMemo(() => data?.byService ?? [], [data]);
  const previousProviders = useMemo(() => data?.previousPeriod?.providers ?? [], [data]);
  const previousServices = useMemo(() => data?.previousPeriod?.byService ?? [], [data]);

  const sortedProviders = useMemo(() => {
    return providers
      .map((provider) => ({
        ...provider,
        previousAmount: previousProviders.find((prev) => prev.provider === provider.provider)?.amount ?? 0,
        percentage: (provider.amount / Math.max(1, totalAmount)) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [providers, previousProviders, totalAmount]);

  const sortedServices = useMemo(() => {
    let cumulative = 0;
    return services
      .map((service) => {
        const previousAmount = previousServices.find((prev) => prev.service === service.service)?.amount;
        cumulative += service.amount;
        return {
          ...service,
          previousAmount,
          percentage: (service.amount / Math.max(1, totalAmount)) * 100,
          cumulativePercent: (cumulative / Math.max(1, totalAmount)) * 100,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [services, previousServices, totalAmount]);

  const averageServiceAmount = useMemo(() => {
    if (services.length === 0) return 0;
    return totalAmount / services.length;
  }, [services, totalAmount]);

  const cspCaption = useMemo(() => {
    if (sortedProviders.length === 0) return '';
    const top = sortedProviders[0];
    return `${top.provider} ${formatCurrency(top.amount)} (${top.percentage.toFixed(1)}%)`;
  }, [sortedProviders]);

  const serviceCaption = useMemo(() => {
    if (sortedServices.length === 0) return '';
    const top = sortedServices[0];
    return `${top.service} ${top.percentage.toFixed(1)}%`;
  }, [sortedServices]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">비용 요약</h2>
          <p className="mt-1 text-sm text-gray-500">
            선택한 기간의 총액, 클라우드 사업자별, 서비스별 비용을 한눈에 확인하세요.
          </p>
        </div>
        <DateRangePicker />
      </div>

      {isLoading && (
        <Card className="border border-gray-200">
          <CardContent className="p-6 text-gray-600">불러오는 중...</CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border border-gray-200">
          <CardContent className="p-6 text-red-600">비용 데이터를 불러오지 못했습니다.</CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && (
        <div className="space-y-6">
          {/* 총 비용 카드 (스파크라인 포함) */}
          <Card className="overflow-hidden border border-gray-200 shadow-sm bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-medium uppercase tracking-wide text-gray-500">총 비용</div>
                  <div className="mt-4 text-4xl font-semibold text-gray-900">{formatCurrency(totalAmount)}</div>
                  <div className="mt-2 text-xs text-gray-500">선택한 기간 동안 발생한 전체 비용</div>
                </div>
                {data.previousPeriod && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">전월</div>
                    <div className="text-lg font-semibold text-gray-700">
                      {formatCurrency(data.previousPeriod.total)}
                    </div>
                    <div className={`text-xs mt-1 ${
                      totalAmount >= data.previousPeriod.total ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {formatPercent(((totalAmount - data.previousPeriod.total) / Math.max(1, data.previousPeriod.total)) * 100)}
                    </div>
                  </div>
                )}
              </div>

              {/* 스파크라인 (간단한 버전) */}
              {data.previousPeriod && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="h-16 relative">
                    {/* 스파크라인 영역 */}
                    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                      {/* 전월 평균선 (점선) */}
                      <line
                        x1="0"
                        y1="30"
                        x2="200"
                        y2="30"
                        stroke="#9CA3AF"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      {/* 간단한 라인 (예시) */}
                      <polyline
                        points="0,50 50,45 100,40 150,35 200,30"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      {/* 이번 달 예측점 */}
                      <circle cx="200" cy="30" r="4" fill="#3B82F6" />
                    </svg>
                    <div className="absolute bottom-0 left-0 text-xs text-gray-500">
                      전월 평균선
                    </div>
                    <div className="absolute top-0 right-0 text-xs text-blue-600 font-medium">
                      이번 달 예측
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CSP별 비용 카드 */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">CSP별 비용</CardTitle>
              </div>
              {cspCaption && (
                <p className="text-xs text-gray-500 mt-2 italic">{cspCaption}</p>
              )}
            </CardHeader>
            <CardContent>
              {providers.length === 0 ? (
                <div className="text-sm text-gray-600">
                  연결된 클라우드 계정이 없습니다.{' '}
                  <button className="underline text-blue-600 hover:text-blue-700" onClick={() => router.push('/accounts')}>
                    계정 연동
                  </button>{' '}
                  후 확인해 주세요.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 원그래프와 범례 */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* 원그래프 */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <ResponsiveContainer width={280} height={280}>
                        <PieChart>
                          <Pie
                            data={sortedProviders.map((p) => ({
                              name: p.provider,
                              value: p.amount,
                              percentage: p.percentage,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {sortedProviders.map((entry, index) => {
                              const getProviderColor = (provider: string) => {
                                if (provider === 'AWS') return '#F97316'; // orange-500
                                if (provider === 'GCP') return '#3B82F6'; // blue-500
                                if (provider === 'Azure') return '#0EA5E9'; // sky-500
                                return '#6B7280'; // gray-500 (fallback)
                              };
                              return <Cell key={`cell-${index}`} fill={getProviderColor(entry.provider)} />;
                            })}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* 범례 */}
                      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                        {sortedProviders.map((providerData, index) => {
                          const getProviderColor = (provider: string) => {
                            if (provider === 'AWS') return '#F97316'; // orange-500
                            if (provider === 'GCP') return '#3B82F6'; // blue-500
                            if (provider === 'Azure') return '#0EA5E9'; // sky-500
                            return '#6B7280'; // gray-500 (fallback)
                          };
                          return (
                            <div key={providerData.provider} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getProviderColor(providerData.provider) }}
                              />
                              <span className="text-sm text-gray-700">
                                {providerData.provider} ({providerData.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 범례 및 상세 정보 */}
                    <div className="flex-1 space-y-4">
                      {sortedProviders.map((providerData, index) => {
                        const getProviderColor = (provider: string) => {
                          if (provider === 'AWS') return '#F97316'; // orange-500
                          if (provider === 'GCP') return '#3B82F6'; // blue-500
                          if (provider === 'Azure') return '#0EA5E9'; // sky-500
                          return '#6B7280'; // gray-500 (fallback)
                        };
                        const change = providerData.previousAmount
                          ? ((providerData.amount - providerData.previousAmount) / Math.max(1, providerData.previousAmount)) * 100
                          : 0;
                        const changeAmount = providerData.previousAmount
                          ? providerData.amount - providerData.previousAmount
                          : 0;

                        return (
                          <div
                            key={providerData.provider}
                            className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: getProviderColor(providerData.provider) }}
                                />
                                <div>
                                  <span className="text-sm font-semibold text-gray-900">{providerData.provider}</span>
                                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                                    {providerData.amount === 0 && providerData.accounts.some(acc => acc.isFreeTierActive) ? (
                                      <span className="flex items-center gap-2 text-green-600">
                                        <Gift className="h-4 w-4" />
                                        <span>프리티어 사용 중</span>
                                      </span>
                                    ) : (
                                      formatCurrency(providerData.amount)
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">
                                  {providerData.percentage.toFixed(1)}%
                                </div>
                                {providerData.previousAmount !== undefined && (
                                  <div
                                    className={`flex items-center gap-1 text-xs mt-1 ${
                                      change >= 0 ? 'text-red-600' : 'text-blue-600'
                                    }`}
                                  >
                                    {change >= 0 ? (
                                      <ArrowUp className="h-3 w-3" />
                                    ) : (
                                      <ArrowDown className="h-3 w-3" />
                                    )}
                                    <span>{formatPercent(Math.abs(change))}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 계정별 상세 정보 */}
                            {providerData.accounts.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {providerData.accounts.map((account) => (
                                    <div
                                      key={`${providerData.provider}-${account.name}`}
                                      className="p-2 bg-gray-50 rounded border border-gray-100"
                                    >
                                      <p className="text-xs font-medium text-gray-600 mb-0.5">{account.name}</p>
                                      {account.amount === 0 && account.isFreeTierActive ? (
                                        <div className="flex items-center gap-1.5">
                                          <Gift className="h-3.5 w-3.5 text-green-600" />
                                          <span className="text-xs font-semibold text-green-600">프리티어 사용 중</span>
                                        </div>
                                      ) : (
                                        <p className="text-sm font-semibold text-gray-900">
                                          {formatCurrency(account.amount)}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {providerData.previousAmount !== undefined && (
                              <div className="mt-2 text-xs text-gray-500">
                                전 기간 대비 {formatCurrency(Math.abs(changeAmount))} ({formatPercent(Math.abs(change))}){' '}
                                {change >= 0 ? '증가' : '감소'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 서비스별 비용 Top */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">서비스별 비용 Top</CardTitle>
                <div className="text-xs text-gray-500">표시 단위: 백만(₩M)</div>
              </div>
              {serviceCaption && (
                <p className="text-xs text-gray-500 mt-2 italic">{serviceCaption}</p>
              )}
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-sm text-gray-600">데이터가 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {sortedServices.map((serviceData) => (
                    <ServiceCostBar
                      key={serviceData.service}
                      service={serviceData.service}
                      amount={serviceData.amount}
                      totalAmount={totalAmount}
                      cumulativePercent={serviceData.cumulativePercent}
                      previousAmount={serviceData.previousAmount}
                      averageAmount={averageServiceAmount}
                      rank={serviceData.rank}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

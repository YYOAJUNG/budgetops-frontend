'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Gift } from 'lucide-react';

// Mock 데이터 타입
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

// Mock 비용 데이터
const mockData = {
  total: 12894000,
  providers: [
    {
      provider: 'AWS',
      amount: 7800000,
      previousAmount: 7200000,
      accounts: [
        { name: 'Production AWS', amount: 5200000, isFreeTierActive: false },
        { name: 'Development AWS', amount: 2600000, isFreeTierActive: false },
      ]
    },
    {
      provider: 'GCP',
      amount: 3984000,
      previousAmount: 3500000,
      accounts: [
        { name: 'Production GCP', amount: 3984000, isFreeTierActive: false },
      ]
    },
    {
      provider: 'Azure',
      amount: 1110000,
      previousAmount: 534000,
      accounts: [
        { name: 'Production Azure', amount: 1110000, isFreeTierActive: false },
      ]
    },
  ],
  byService: [
    { service: 'EC2', amount: 4200000, previousAmount: 3900000 },
    { service: 'BigQuery', amount: 2400000, previousAmount: 2200000 },
    { service: 'S3', amount: 1200000, previousAmount: 1100000 },
    { service: 'RDS', amount: 900000, previousAmount: 850000 },
    { service: 'Cloud Storage', amount: 640000, previousAmount: 600000 },
    { service: 'Lambda', amount: 580000, previousAmount: 520000 },
  ],
  previousPeriod: {
    total: 11234000,
    providers: [],
    byService: [],
  }
};

function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// 서비스별 비용 막대 컴포넌트 (실제 코드와 동일)
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
      </div>
    </div>
  );
}

export function CostsContent() {
  const data = mockData;
  const totalAmount = data.total;
  const providers = useMemo(() => data.providers, []);
  const services = useMemo(() => data.byService, []);
  const previousProviders = useMemo(() => data.previousPeriod?.providers ?? [], []);
  const previousServices = useMemo(() => data.previousPeriod?.byService ?? [], []);

  const sortedProviders = useMemo(() => {
    return providers
      .map((provider) => ({
        ...provider,
        previousAmount: previousProviders.find((prev) => prev.provider === provider.provider)?.amount ?? provider.previousAmount ?? 0,
        percentage: (provider.amount / Math.max(1, totalAmount)) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [providers, previousProviders, totalAmount]);

  const sortedServices = useMemo(() => {
    let cumulative = 0;
    return services
      .map((service) => {
        const previousAmount = previousServices.find((prev) => prev.service === service.service)?.amount ?? service.previousAmount;
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
      {/* 총 비용 카드 */}
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
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
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
                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                    return (
                      <div key={providerData.provider} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
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
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
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
                            style={{ backgroundColor: colors[index % colors.length] }}
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
        </CardContent>
      </Card>

      {/* 서비스별 비용 Top */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">서비스별 비용 Top</CardTitle>
          </div>
          {serviceCaption && (
            <p className="text-xs text-gray-500 mt-2 italic">{serviceCaption}</p>
          )}
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}

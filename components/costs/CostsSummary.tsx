'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/layout/DateRangePicker';
import { useQuery } from '@tanstack/react-query';
import { useContextStore } from '@/store/context';
import { formatCurrency, formatCurrencyCompact, formatPercent, calculateHHI } from '@/lib/utils';
import { ArrowUp, ArrowDown, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

type CostsResponse = {
  total: number;
  byProvider: Record<string, number>;
  byService: Array<{ service: string; amount: number }>;
  previousPeriod?: {
    total: number;
    byProvider: Record<string, number>;
    byService: Array<{ service: string; amount: number }>;
  };
};

// 임시 목 데이터 (전월 데이터 포함)
function mockFetchCosts(from: string, to: string): Promise<CostsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total: 12894000,
        byProvider: { AWS: 7800000, GCP: 3984000, Azure: 1200000 },
        byService: [
          { service: 'EC2', amount: 4200000 },
          { service: 'S3', amount: 1200000 },
          { service: 'RDS', amount: 900000 },
          { service: 'BigQuery', amount: 2400000 },
          { service: 'Cloud Storage', amount: 640000 },
        ],
        previousPeriod: {
          total: 12000000,
          byProvider: { AWS: 7200000, GCP: 3600000, Azure: 1200000 },
          byService: [
            { service: 'EC2', amount: 4000000 },
            { service: 'S3', amount: 1100000 },
            { service: 'RDS', amount: 850000 },
            { service: 'BigQuery', amount: 2200000 },
            { service: 'Cloud Storage', amount: 600000 },
          ],
        },
      });
    }, 400);
  });
}

// CSP별 비용 카드 컴포넌트
function CspCostCard({
  provider,
  amount,
  totalAmount,
  previousAmount,
  averageLine,
  hhi,
  rank,
  ratioToSecond,
}: {
  provider: string;
  amount: number;
  totalAmount: number;
  previousAmount?: number;
  averageLine: number;
  hhi: number;
  rank: number;
  ratioToSecond: number;
}) {
  const percentage = (amount / Math.max(1, totalAmount)) * 100;
  const previousPercentage = previousAmount ? (previousAmount / Math.max(1, totalAmount)) * 100 : 0;
  const change = previousAmount ? ((amount - previousAmount) / Math.max(1, previousAmount)) * 100 : 0;
  const changeAmount = previousAmount ? amount - previousAmount : 0;

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{provider}</span>
            {rank === 1 && (
              <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium">1위</span>
            )}
          </div>
          <div className="text-xl font-semibold text-gray-900">{formatCurrency(amount)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</div>
          {previousAmount && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{formatPercent(Math.abs(change))}</span>
            </div>
          )}
        </div>
      </div>

      {/* 막대 그래프 */}
      <div className="relative mt-4 h-8 rounded-full bg-gray-100 overflow-hidden">
        {/* 평균선 (33.3%) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 border-l border-dashed border-gray-400 z-10"
          style={{ left: `${averageLine}%` }}
        >
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
            평균 33.3%
          </div>
        </div>

        {/* 전월 막대 (연한) */}
        {previousAmount && (
          <div
            className="absolute top-0 bottom-0 rounded-full bg-gray-300 opacity-40"
            style={{ width: `${Math.min(100, previousPercentage)}%` }}
          />
        )}

        {/* 현재 막대 (진한) */}
        <div
          className="absolute top-0 bottom-0 rounded-full bg-blue-500 relative z-20"
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

        {/* 퍼센트 라벨 (막대 끝) */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap z-30"
          style={{ left: `${Math.min(95, percentage + 2)}%` }}
        >
          {percentage.toFixed(1)}%
        </div>
      </div>

      {/* HHI 배지 및 툴팁 */}
      <div className="mt-3 flex items-center justify-between">
        <Tooltip
          content={
            <div className="text-xs space-y-1">
              <p className="font-semibold">HHI (집중도 지수)</p>
              <p>HHI = Σ(시장점유율²) × 100</p>
              <p className="text-gray-400 mt-1">
                {hhi > 2500 ? '집중 높음' : hhi > 1500 ? '집중 보통' : '집중 낮음'}
              </p>
            </div>
          }
        >
          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center gap-1">
            <Info className="h-3 w-3" />
            HHI {Math.round(hhi).toLocaleString()}
          </button>
        </Tooltip>

        {rank === 1 && ratioToSecond > 0 && (
          <div className="text-xs text-gray-500">
            {ratioToSecond.toFixed(2)}배 차이
          </div>
        )}
      </div>

      {/* 확장 툴팁 (hover 시) */}
      <Tooltip
        content={
          <div className="text-xs space-y-1">
            <p><strong>금액:</strong> {formatCurrency(amount)}</p>
            <p><strong>비중:</strong> {percentage.toFixed(1)}%</p>
            {previousAmount && (
              <>
                <p><strong>전월 대비:</strong> {formatPercent(change)} ({formatCurrency(Math.abs(changeAmount))})</p>
                {rank === 1 && ratioToSecond > 0 && (
                  <p><strong>1위/2위 차이:</strong> {ratioToSecond.toFixed(2)}배</p>
                )}
              </>
            )}
          </div>
        }
      >
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 cursor-help hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <span>금액:</span>
            <span className="font-semibold">{formatCurrency(amount)}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>비중:</span>
            <span className="font-semibold">{percentage.toFixed(1)}%</span>
          </div>
          {previousAmount && (
            <>
              <div className="flex items-center justify-between mt-1">
                <span>전월 대비:</span>
                <span className={`font-semibold ${change >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatPercent(change)} ({formatCurrency(Math.abs(changeAmount))})
                </span>
              </div>
              {rank === 1 && ratioToSecond > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <span>1위/2위 차이:</span>
                  <span className="font-semibold">{ratioToSecond.toFixed(2)}배</span>
                </div>
              )}
            </>
          )}
        </div>
      </Tooltip>
    </div>
  );
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
  const { from, to } = useContextStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costsSummary', { from, to }],
    queryFn: () => mockFetchCosts(from, to),
  });

  const totalAmount = data?.total ?? 0;
  const providers = Object.entries(data?.byProvider ?? {});
  const services = useMemo(() => data?.byService ?? [], [data]);
  const previousProviders = useMemo(() => Object.entries(data?.previousPeriod?.byProvider ?? {}), [data]);
  const previousServices = useMemo(() => data?.previousPeriod?.byService ?? [], [data]);

  // CSP 정렬 및 계산
  const sortedProviders = useMemo(() => {
    return providers
      .map(([provider, amount], index) => {
        const prev = previousProviders.find(([p]) => p === provider)?.[1];
        return {
          provider,
          amount,
          previousAmount: prev,
          percentage: (amount / Math.max(1, totalAmount)) * 100,
          rank: index + 1,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [providers, totalAmount, previousProviders]);

  // HHI 계산
  const hhi = useMemo(() => {
    const amounts = sortedProviders.map((p) => p.amount);
    return calculateHHI(amounts);
  }, [sortedProviders]);

  // 1위/2위 비율 계산
  const ratioToSecond = useMemo(() => {
    if (sortedProviders.length < 2) return 0;
    return sortedProviders[0].amount / sortedProviders[1].amount;
  }, [sortedProviders]);

  // 서비스 정렬 및 누적 계산
  const sortedServices = useMemo(() => {
    let cumulative = 0;
    return services
      .map((s, index) => {
        const prev = previousServices.find((ps) => ps.service === s.service)?.amount;
        cumulative += s.amount;
        return {
          ...s,
          previousAmount: prev,
          percentage: (s.amount / Math.max(1, totalAmount)) * 100,
          cumulativeAmount: cumulative,
          cumulativePercent: (cumulative / Math.max(1, totalAmount)) * 100,
          rank: index + 1,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => {
        // 누적 재계산
        const prevItems = services
          .sort((a, b) => b.amount - a.amount)
          .slice(0, index);
        const cumulative = prevItems.reduce((sum, s) => sum + s.amount, 0) + item.amount;
        return {
          ...item,
          rank: index + 1,
          cumulativeAmount: cumulative,
          cumulativePercent: (cumulative / Math.max(1, totalAmount)) * 100,
        };
      });
  }, [services, totalAmount, previousServices]);

  // 서비스 평균 금액
  const averageServiceAmount = useMemo(() => {
    if (services.length === 0) return 0;
    return totalAmount / services.length;
  }, [services, totalAmount]);

  // 상위 2개 서비스 합계
  const top2ServicesPercent = useMemo(() => {
    if (sortedServices.length < 2) return 0;
    return sortedServices[0].percentage + sortedServices[1].percentage;
  }, [sortedServices]);

  // CSP 그래프 캡션
  const cspCaption = useMemo(() => {
    if (sortedProviders.length === 0) return '';
    const top = sortedProviders[0];
    const second = sortedProviders[1];
    if (!second) return `${top.provider} ${top.percentage.toFixed(1)}%`;
    return `${top.provider} ${top.percentage.toFixed(1)}% (${second.provider}의 ${ratioToSecond.toFixed(2)}배), 집중도 HHI ${Math.round(hhi).toLocaleString()}`;
  }, [sortedProviders, ratioToSecond, hhi]);

  // 서비스 그래프 캡션
  const serviceCaption = useMemo(() => {
    if (sortedServices.length === 0) return '';
    const top = sortedServices[0];
    const second = sortedServices[1];
    if (!second) return `${top.service} ${top.percentage.toFixed(1)}% 1위`;
    return `${top.service} ${top.percentage.toFixed(1)}% 1위, 상위 2개(${top.service}+${second.service}) ${top2ServicesPercent.toFixed(1)}%`;
  }, [sortedServices, top2ServicesPercent]);

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
                  {sortedServices.length >= 2 && (
                    <div className="mt-2 text-xs text-gray-500 italic">
                      상위 2서비스가 {top2ServicesPercent.toFixed(1)}% 차지
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CSP별 비용 카드 */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">CSP별 비용</CardTitle>
                {hhi > 0 && (
                  <Tooltip
                    content={
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">HHI 계산식</p>
                        <p>HHI = Σ(시장점유율²) × 100</p>
                        <p className="text-gray-400 mt-1">
                          {sortedProviders.map((p, i) => (
                            <span key={p.provider}>
                              {i > 0 && ' + '}
                              ({p.percentage.toFixed(1)}%)²
                            </span>
                          ))}
                        </p>
                      </div>
                    }
                  >
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded cursor-help hover:bg-gray-200 transition-colors">
                      HHI {Math.round(hhi).toLocaleString()} (집중 {hhi > 2500 ? '높음' : hhi > 1500 ? '보통' : '낮음'})
                    </span>
                  </Tooltip>
                )}
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
                <div className="grid gap-4 md:grid-cols-3">
                  {sortedProviders.map((providerData) => (
                    <CspCostCard
                      key={providerData.provider}
                      provider={providerData.provider}
                      amount={providerData.amount}
                      totalAmount={totalAmount}
                      previousAmount={providerData.previousAmount}
                      averageLine={33.3}
                      hhi={hhi}
                      rank={providerData.rank}
                      ratioToSecond={providerData.rank === 1 ? ratioToSecond : 0}
                    />
                  ))}
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

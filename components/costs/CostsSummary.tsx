'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/layout/DateRangePicker';
import { useQuery } from '@tanstack/react-query';
import { useContextStore } from '@/store/context';

type CostsResponse = {
  total: number;
  byProvider: Record<string, number>;
  byService: Array<{ service: string; amount: number }>;
};

// 임시 목 데이터 (추후 API 연동 시 교체)
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
      });
    }, 400);
  });
}

function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString()}`;
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
          <Card className="overflow-hidden border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="text-sm font-medium uppercase tracking-wide text-gray-500">총 비용</div>
              <div className="mt-4 text-4xl font-semibold text-gray-900">{formatCurrency(totalAmount)}</div>
              <div className="mt-2 text-xs text-gray-500">선택한 기간 동안 발생한 전체 비용</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">CSP별 비용</CardTitle>
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
                  {providers.map(([provider, amount]) => (
                    <div key={provider} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{provider}</div>
                      <div className="mt-2 text-xl font-semibold text-gray-900">{formatCurrency(amount)}</div>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, (amount / Math.max(1, totalAmount)) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {Math.round((amount / Math.max(1, totalAmount)) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">CSP별 비용 Top</CardTitle>
              </CardHeader>
              <CardContent>
                {providers.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    연결된 클라우드 계정이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providers
                      .sort((a, b) => b[1] - a[1])
                      .map(([provider, amount]) => (
                        <div key={provider} className="text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 font-medium">{provider}</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${Math.min(100, (amount / Math.max(1, totalAmount)) * 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round((amount / Math.max(1, totalAmount)) * 100)}%
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">서비스별 비용 Top</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-sm text-gray-600">데이터가 없습니다.</div>
                ) : (
                  <div className="space-y-3">
                    {services.map((s) => (
                      <div key={s.service} className="text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 font-medium">{s.service}</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(s.amount)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.min(100, (s.amount / Math.max(1, totalAmount)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

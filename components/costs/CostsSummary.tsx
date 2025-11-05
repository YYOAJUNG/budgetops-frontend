'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
// import { DateRangePicker } from '@/components/layout/DateRangePicker';
import { useQuery } from '@tanstack/react-query';

type CSP = 'AWS' | 'GCP' | 'Azure';

type CostsSummaryItem = {
  provider: CSP;
  service: string;
  amount: number;
};

type CostsResponse = {
  total: number;
  byProvider: Record<CSP, number>;
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

function formatCurrencyKRW(amount: number): string {
  return `₩${amount.toLocaleString()}`;
}

function RangeSwitch({ value, onChange }: { value: '7d' | '30d' | '90d'; onChange: (v: '7d' | '30d' | '90d') => void }) {
  return (
    <div className="flex items-center gap-2">
      {(['7d', '30d', '90d'] as const).map((r) => (
        <button
          key={r}
          className={`px-3 py-1 rounded border ${value===r?'bg-gray-900 text-white':'bg-white'}`}
          onClick={() => onChange(r)}
        >
          {r.replace('d','일')}
        </button>
      ))}
    </div>
  );
}

export function CostsSummary() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [from, to] = useMemo(() => {
    const now = Date.now();
    const days = range === '7d' ? 6 : range === '30d' ? 29 : 89;
    return [new Date(now - days * 86400000).toISOString(), new Date(now).toISOString()];
  }, [range]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costsSummary', { from, to }],
    queryFn: () => mockFetchCosts(from, to),
  });

  const byService = useMemo(() => data?.byService ?? [], [data]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">비용 요약</h2>
          <p className="text-gray-600 mt-1">선택한 기간의 총액, CSP별, 서비스별 비용</p>
        </div>
        <RangeSwitch value={range} onChange={setRange} />
      </div>

      {/* 상태 처리 */}
      {isLoading && (
        <Card>
          <CardContent className="p-6 text-gray-600">불러오는 중...</CardContent>
        </Card>
      )}
      {isError && (
        <Card>
          <CardContent className="p-6 text-red-600">
            비용 데이터를 불러오지 못했습니다.
          </CardContent>
        </Card>
      )}
      {!isLoading && !isError && data && (
        <>
          {/* 총액 카드 */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="총 비용" value={formatCurrencyKRW(data.total)} />
            <StatCard title="AWS" value={formatCurrencyKRW(data.byProvider.AWS)} />
            <StatCard title="GCP" value={formatCurrencyKRW(data.byProvider.GCP)} />
          </div>

          {/* CSP별/서비스별 카드 레이아웃 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CSP별 비용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['AWS', 'GCP', 'Azure'] as CSP[]).map((p) => (
                    <div key={p} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{p}</span>
                      <span className="font-semibold text-gray-900">{formatCurrencyKRW(data.byProvider[p] || 0)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>서비스별 비용 Top</CardTitle>
              </CardHeader>
              <CardContent>
                {byService.length === 0 ? (
                  <div className="text-sm text-gray-600">데이터가 없습니다.</div>
                ) : (
                  <div className="space-y-3">
                    {byService.map((s) => (
                      <div key={s.service} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{s.service}</span>
                        <span className="font-semibold text-gray-900">{formatCurrencyKRW(s.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}



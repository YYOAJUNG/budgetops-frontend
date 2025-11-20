'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getFreeTierUsage, FreeTierUsage } from '@/lib/api/resources';

const DANGER_THRESHOLD = 0.85;  // 15% 미만 남음 (85% 이상 사용)
const WARNING_THRESHOLD = 0.7;  // 30% 미만 남음 (70% 이상 사용)

function usageRatio(usage: FreeTierUsage): number {
  if (!usage.quota) return 0;
  return usage.used / usage.quota;
}

function remainingPercent(usage: FreeTierUsage): number {
  const ratio = usageRatio(usage);
  return Math.round((1 - ratio) * 100);
}

function usageLabel(usage: FreeTierUsage): string {
  const ratioPercent = Math.round(usageRatio(usage) * 100);
  const remaining = remainingPercent(usage);
  return `${usage.used}/${usage.quota} ${usage.unit} (${ratioPercent}% 사용, ${remaining}% 남음)`;
}

function progressColor(ratio: number): 'default' | 'warning' | 'danger' {
  if (ratio >= DANGER_THRESHOLD) return 'danger';  // 15% 미만 남음
  if (ratio >= WARNING_THRESHOLD) return 'warning'; // 30% 미만 남음
  return 'default';
}

export function FreeTierCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['freeTierUsage'],
    queryFn: getFreeTierUsage,
  });

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-800">프리티어 현황</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-slate-500">프리티어 데이터를 불러오는 중입니다...</div>
        ) : isError ? (
          <div className="text-sm text-red-600">프리티어 데이터를 불러오지 못했습니다.</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-slate-500">등록된 프리티어 정보가 없습니다.</div>
        ) : (
          data.map((usage) => {
            const ratio = usageRatio(usage);
            const variant = progressColor(ratio);
            return (
              <div key={usage.provider} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      usage.provider === 'AWS' 
                        ? 'bg-orange-100 text-orange-700'
                        : usage.provider === 'GCP'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-sky-100 text-sky-700'
                    }>{usage.provider}</Badge>
                    {variant !== 'default' && (
                      <Badge
                        variant="outline"
                        className={
                          variant === 'danger'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                        }
                      >
                        {variant === 'danger' ? '위험 (15% 미만)' : '주의'}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-600">{usageLabel(usage)}</span>
                </div>
                <Progress value={Math.min(100, ratio * 100)} variant={variant} />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FreeTierInfo {
  provider: 'AWS' | 'GCP' | 'Azure' | 'NCP';
  serviceName: string;
  used: number;
  limit: number;
  unit: string;
  isActive: boolean;
}

interface FreeTierUsageProps {
  freeTierData: FreeTierInfo[];
}

export function FreeTierUsage({ freeTierData }: FreeTierUsageProps) {
  if (freeTierData.length === 0) {
    return null;
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'AWS':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'GCP':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Azure':
        return 'bg-sky-100 text-sky-700 border-sky-300';
      case 'NCP':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">프리티어 사용현황</h2>
        <p className="text-sm text-gray-500 mt-1">각 클라우드 제공자의 무료 사용량 현황</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {freeTierData.map((tier, index) => {
          const percentage = (tier.used / tier.limit) * 100;
          const isNearLimit = percentage >= 80;

          return (
            <Card 
              key={`${tier.provider}-${index}`}
              className={`border ${isNearLimit ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getProviderColor(tier.provider)}>
                      {tier.provider}
                    </Badge>
                    <span className="text-sm font-medium text-slate-700">
                      {tier.serviceName}
                    </span>
                  </div>
                  {tier.isActive && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      활성
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">
                    {tier.used.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-600">
                    / {tier.limit.toLocaleString()} {tier.unit}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">사용률</span>
                    <span className={`font-semibold ${isNearLimit ? 'text-red-600' : 'text-slate-900'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {isNearLimit && (
                  <div className="pt-2 border-t border-red-200">
                    <p className="text-xs text-red-600">
                      ⚠️ 프리티어 한도의 80% 이상 사용 중입니다
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TrendingUp } from 'lucide-react';

export function CostForecast() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">비용 예측</h2>
        <p className="text-muted-foreground">향후 비용 트렌드를 예측하고 예산 계획을 세우세요</p>
      </div>

      <EmptyState
        icon={<TrendingUp className="h-12 w-12" />}
        title="비용 예측 모델 준비 중"
        description="과거 데이터를 기반으로 비용 예측 모델을 학습하고 있습니다."
        action={{
          label: "새로고침",
          onClick: () => window.location.reload()
        }}
      />
    </div>
  );
}

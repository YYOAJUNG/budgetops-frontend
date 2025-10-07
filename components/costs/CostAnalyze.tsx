'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart3 } from 'lucide-react';

export function CostAnalyze() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">비용 분석</h2>
        <p className="text-gray-600 mt-2">기간별, 서비스별 비용을 상세히 분석하세요</p>
      </div>

      <EmptyState
        icon={<BarChart3 className="h-12 w-12" />}
        title="비용 분석 데이터 준비 중"
        description="비용 데이터를 수집하고 분석 차트를 준비하고 있습니다."
        action={{
          label: "새로고침",
          onClick: () => window.location.reload()
        }}
      />
    </div>
  );
}

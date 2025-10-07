'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertTriangle } from 'lucide-react';

export function CostAnomalies() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">비용 이상징후</h2>
        <p className="text-muted-foreground">비정상적인 비용 급등/급락을 탐지합니다</p>
      </div>

      <EmptyState
        icon={<AlertTriangle className="h-12 w-12" />}
        title="이상징후 분석 중"
        description="비용 패턴을 분석하여 이상징후를 탐지하고 있습니다."
        action={{
          label: "새로고침",
          onClick: () => window.location.reload()
        }}
      />
    </div>
  );
}

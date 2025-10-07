'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Target } from 'lucide-react';

export function Budgets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">예산 관리</h1>
        <p className="text-muted-foreground">월간, 분기, 연간 예산을 설정하고 관리하세요</p>
      </div>

      <EmptyState
        icon={<Target className="h-12 w-12" />}
        title="예산 설정"
        description="첫 번째 예산을 생성하여 비용을 효과적으로 관리하세요."
        action={{
          label: "예산 생성",
          onClick: () => console.log('Create budget')
        }}
      />
    </div>
  );
}

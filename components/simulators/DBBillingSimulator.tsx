'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Calculator } from 'lucide-react';

export function DBBillingSimulator() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DB Billing 시뮬레이터</h1>
        <p className="text-muted-foreground">데이터베이스 비용을 미리 계산해보세요</p>
      </div>

      <EmptyState
        icon={<Calculator className="h-12 w-12" />}
        title="시뮬레이터 준비 중"
        description="다양한 클라우드 프로바이더의 DB 비용을 계산할 수 있는 시뮬레이터를 준비하고 있습니다."
        action={{
          label: "시뮬레이터 시작",
          onClick: () => console.log('Start simulator')
        }}
      />
    </div>
  );
}

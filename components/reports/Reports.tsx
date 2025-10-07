'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">리포트</h2>
        <p className="text-muted-foreground">월간, 주간 리포트를 생성하고 다운로드하세요</p>
      </div>

      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="리포트 생성"
        description="비용 분석 리포트를 생성하여 팀과 공유하세요."
        action={{
          label: "리포트 생성",
          onClick: () => console.log('Generate report')
        }}
      />
    </div>
  );
}

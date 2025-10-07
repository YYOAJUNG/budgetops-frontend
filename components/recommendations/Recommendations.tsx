'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Lightbulb } from 'lucide-react';

export function Recommendations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">최적화 권고</h2>
        <p className="text-muted-foreground">비용 절감을 위한 맞춤형 권고사항을 확인하세요</p>
      </div>

      <EmptyState
        icon={<Lightbulb className="h-12 w-12" />}
        title="권고사항 분석 중"
        description="클라우드 리소스를 분석하여 최적화 권고사항을 생성하고 있습니다."
        action={{
          label: "새로고침",
          onClick: () => window.location.reload()
        }}
      />
    </div>
  );
}

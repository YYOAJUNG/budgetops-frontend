'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Cloud } from 'lucide-react';

export function Accounts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">클라우드 계정</h1>
        <p className="text-muted-foreground">AWS, GCP, Azure, NCP 계정을 연결하세요</p>
      </div>

      <EmptyState
        icon={<Cloud className="h-12 w-12" />}
        title="계정 연결"
        description="클라우드 계정을 연결하여 비용 데이터를 수집하세요."
        action={{
          label: "계정 연결하기",
          onClick: () => console.log('Connect account')
        }}
      />
    </div>
  );
}

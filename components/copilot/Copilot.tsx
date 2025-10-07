'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Bot } from 'lucide-react';

export function Copilot() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI 코파일럿</h2>
        <p className="text-muted-foreground">AI와 대화하며 비용 최적화 조언을 받으세요</p>
      </div>

      <EmptyState
        icon={<Bot className="h-12 w-12" />}
        title="AI 코파일럿 준비 중"
        description="AI 코파일럿이 비용 최적화를 위한 맞춤형 조언을 제공할 준비를 하고 있습니다."
        action={{
          label: "대화 시작",
          onClick: () => console.log('Start chat')
        }}
      />
    </div>
  );
}

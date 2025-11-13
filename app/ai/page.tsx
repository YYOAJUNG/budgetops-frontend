'use client';

import { useEffect } from 'react';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { useUIStore } from '@/store/ui';

export default function AIPage() {
  const { setAIChatOpen } = useUIStore();

  useEffect(() => {
    setAIChatOpen(true);
  }, [setAIChatOpen]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold mb-2">AI 코파일럿</h1>
      <p className="text-sm text-gray-600 mb-4">
        비용 최적화 조언을 AI에게 물어보세요.
      </p>
      {/* 페이지 진입 시 우측 패널이 열리도록 구성 */}
      <AIChatPanel />
    </div>
  );
}



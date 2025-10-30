import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export function CopilotContent() {
  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI 코파일럿</h3>
          </div>
          <p className="text-gray-600 mb-6">
            자연어로 질문하고 클라우드 비용에 대한 인사이트를 얻으세요.
          </p>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">사용자</p>
              <p className="text-gray-900">지난 주에 비용이 가장 많이 증가한 서비스는?</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-2">AI 코파일럿</p>
              <p className="text-gray-900">
                AWS EC2가 지난 주 대비 156% 증가하여 가장 큰 비용 증가를 보였습니다.
                주로 새로 시작된 t3.xlarge 인스턴스 15개가 원인입니다.
                이 중 8개는 낮은 CPU 사용률(&lt;20%)을 보이고 있어 다운사이징을 권장합니다.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-3">추천 질문:</p>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                이번 달 예산을 초과할 가능성은?
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                가장 큰 비용 절감 기회는 무엇인가요?
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                사용하지 않는 리소스는 몇 개인가요?
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

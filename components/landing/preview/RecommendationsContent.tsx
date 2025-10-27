import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

const recommendations = [
  {
    title: 'EC2 인스턴스 다운사이징',
    saving: 450,
    impact: 'high',
    description: '5개의 과도하게 프로비저닝된 EC2 인스턴스를 더 작은 크기로 변경하세요.'
  },
  {
    title: 'S3 수명주기 정책 설정',
    saving: 280,
    impact: 'medium',
    description: '오래된 데이터를 Glacier로 이동하여 스토리지 비용을 절감하세요.'
  },
  {
    title: 'Reserved Instance 구매',
    saving: 820,
    impact: 'high',
    description: '장기 사용 리소스에 대해 RI를 구매하여 최대 72% 절감하세요.'
  },
];

export function RecommendationsContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">총 절감 가능액</p>
            <p className="text-3xl font-bold text-green-600">$1,550</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">활성 권장사항</p>
            <p className="text-3xl font-bold text-gray-900">7</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최적화 권장사항</h3>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ${rec.saving}/월 절감
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 ml-8">{rec.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';

const anomalies = [
  { service: 'AWS EC2', type: '비정상적 증가', severity: 'high', change: '+156%', detected: '2시간 전' },
  { service: 'AWS RDS', type: '비정상적 증가', severity: 'medium', change: '+89%', detected: '5시간 전' },
  { service: 'GCP Compute', type: '예상치 못한 사용', severity: 'low', change: '+34%', detected: '1일 전' },
];

export function AnomaliesContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">총 이상 징후</p>
            <p className="text-3xl font-bold text-gray-900">12</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">높은 심각도</p>
            <p className="text-3xl font-bold text-red-600">3</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">해결됨</p>
            <p className="text-3xl font-bold text-green-600">8</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 이상 징후</h3>
          <div className="space-y-3">
            {anomalies.map((anomaly, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`h-2 w-2 rounded-full ${
                    anomaly.severity === 'high' ? 'bg-red-500' : anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{anomaly.service}</p>
                    <p className="text-sm text-gray-500">{anomaly.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">변화</p>
                    <p className="font-medium text-red-600">{anomaly.change}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{anomaly.detected}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

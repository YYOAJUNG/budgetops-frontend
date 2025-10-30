import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, CheckCircle } from 'lucide-react';

const accounts = [
  { name: 'Production AWS', provider: 'AWS', status: 'active', resources: 156, cost: 2133 },
  { name: 'Staging GCP', provider: 'GCP', status: 'active', resources: 43, cost: 456 },
  { name: 'Dev Azure', provider: 'Azure', status: 'active', resources: 67, cost: 443 },
  { name: 'Analytics AWS', provider: 'AWS', status: 'active', resources: 28, cost: 391 },
];

export function AccountsContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">연결된 계정</p>
            <p className="text-3xl font-bold text-gray-900">8</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">총 리소스</p>
            <p className="text-3xl font-bold text-gray-900">294</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">활성 계정</p>
            <p className="text-3xl font-bold text-gray-900">8</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">클라우드 계정 목록</h3>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500">{account.provider}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">리소스</p>
                    <p className="font-medium text-gray-900">{account.resources}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">월 비용</p>
                    <p className="font-medium text-gray-900">${account.cost}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

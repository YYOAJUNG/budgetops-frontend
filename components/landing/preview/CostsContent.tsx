import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const costByService = [
  { name: 'EC2', cost: 1200 },
  { name: 'S3', cost: 800 },
  { name: 'RDS', cost: 650 },
  { name: 'Lambda', cost: 400 },
  { name: 'CloudFront', cost: 350 },
];

export function CostsContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">이번 달 총 비용</p>
            <p className="text-3xl font-bold text-gray-900">$4,365</p>
            <div className="flex items-center mt-2 text-sm text-red-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+5.6% vs 지난 달</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">일 평균 비용</p>
            <p className="text-3xl font-bold text-gray-900">$145</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">예상 월말 비용</p>
            <p className="text-3xl font-bold text-gray-900">$5,234</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스별 비용 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByService}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => [`$${value}`, '비용']} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

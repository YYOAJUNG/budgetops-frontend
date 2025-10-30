import { Card, CardContent } from '@/components/ui/card';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const forecastData = [
  { month: '1월', actual: 3200, forecast: 3200 },
  { month: '2월', actual: 3800, forecast: 3750 },
  { month: '3월', actual: 4365, forecast: 4200 },
  { month: '4월', actual: null, forecast: 4800 },
  { month: '5월', actual: null, forecast: 5200 },
  { month: '6월', actual: null, forecast: 5500 },
];

export function ForecastContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">다음 달 예상 비용</p>
            <p className="text-3xl font-bold text-gray-900">$4,800</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">3개월 예상 비용</p>
            <p className="text-3xl font-bold text-gray-900">$15,500</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">예상 증가율</p>
            <p className="text-3xl font-bold text-orange-600">+9.8%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">비용 예측</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => [`$${value}`, '비용']} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="실제" />
                <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="예측" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

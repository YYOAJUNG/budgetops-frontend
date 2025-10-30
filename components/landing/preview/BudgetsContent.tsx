import { Card, CardContent } from '@/components/ui/card';

const budgets = [
  { name: 'Production 예산', allocated: 5000, spent: 3900, percentage: 78 },
  { name: 'Development 예산', allocated: 2000, spent: 1200, percentage: 60 },
  { name: 'Testing 예산', allocated: 1000, spent: 850, percentage: 85 },
];

export function BudgetsContent() {
  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">예산 현황</h3>
          <div className="space-y-6">
            {budgets.map((budget) => (
              <div key={budget.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{budget.name}</span>
                  <span className="text-sm text-gray-600">
                    ${budget.spent} / ${budget.allocated}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      budget.percentage > 80 ? 'bg-red-500' : budget.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${budget.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{budget.percentage}% 사용</span>
                  <span className="text-gray-600">${budget.allocated - budget.spent} 남음</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

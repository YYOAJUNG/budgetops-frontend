'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Clock, DollarSign, Archive, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { SimulateRequest, SimulationResult, simulate } from '@/lib/api/simulator';
import { useQuery } from '@tanstack/react-query';
import { SimulationPanel } from './SimulationPanel';

interface RecommendationCardProps {
  title: string;
  description: string;
  estimatedSavings: number;
  actionType: 'offhours' | 'commitment' | 'storage';
  resourceIds: string[];
  icon: React.ReactNode;
}

function RecommendationCard({
  title,
  description,
  estimatedSavings,
  actionType,
  resourceIds,
  icon,
}: RecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showSimulationPanel, setShowSimulationPanel] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);

  const { isLoading, refetch } = useQuery({
    queryKey: ['simulation', actionType, resourceIds],
    queryFn: async () => {
      const request: SimulateRequest = {
        resourceIds,
        action: actionType,
      };
      const response = await simulate(request);
      setSimulationResults(response.scenarios);
      return response;
    },
    enabled: showDetails && resourceIds.length > 0,
  });

  const handleViewDetails = () => {
    setShowDetails(true);
    refetch();
  };

  const handleSimulate = () => {
    setShowSimulationPanel(true);
  };

  const handleApprove = () => {
    // 제안서 생성 및 승인 (추후 구현)
    console.log('Create proposal for', actionType);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(estimatedSavings, 'KRW')}
            </p>
            <p className="text-xs text-gray-500 mt-1">월 예상 절감액</p>
          </div>

          {showDetails && isLoading && (
            <div className="text-sm text-gray-500">시뮬레이션 실행 중...</div>
          )}

          {showDetails && simulationResults.length > 0 && (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">시나리오 결과:</p>
              {simulationResults.slice(0, 3).map((result, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">{result.scenarioName}</p>
                  <p className="text-xs text-gray-600">{result.description}</p>
                  <p className="text-xs text-indigo-600 mt-1">
                    절감액: {formatCurrency(result.savings, 'KRW')}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1"
            >
              근거 보기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulate}
              className="flex-1"
            >
              시뮬레이션
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              승인
            </Button>
          </div>
        </div>
      </CardContent>

      {showSimulationPanel && (
        <SimulationPanel
          resourceIds={resourceIds}
          actionType={actionType}
          onClose={() => setShowSimulationPanel(false)}
        />
      )}
    </Card>
  );
}

interface RecommendationCardsProps {
  resourceIds: string[];
}

export function RecommendationCards({ resourceIds }: RecommendationCardsProps) {
  // TODO: 실제 추천 데이터를 API에서 가져오기
  // 현재는 예시 데이터
  const recommendations = [
    {
      title: 'Off-hours로 월 최대 절감 예상',
      description: '주중 20:00~08:30 중단으로 비용 절감',
      estimatedSavings: 150000,
      actionType: 'offhours' as const,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: '커밋 70%로 전환 시 절감',
      description: '1년 약정으로 온디맨드 대비 50% 할인',
      estimatedSavings: 200000,
      actionType: 'commitment' as const,
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: '90일 미접근 스토리지 아카이빙',
      description: 'Cold 스토리지로 이동하여 비용 절감',
      estimatedSavings: 50000,
      actionType: 'storage' as const,
      icon: <Archive className="h-5 w-5" />,
    },
  ];

  if (resourceIds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        리소스를 선택하면 추천 액션을 확인할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {recommendations.map((rec, idx) => (
        <RecommendationCard
          key={idx}
          title={rec.title}
          description={rec.description}
          estimatedSavings={rec.estimatedSavings}
          actionType={rec.actionType}
          resourceIds={resourceIds}
          icon={rec.icon}
        />
      ))}
    </div>
  );
}


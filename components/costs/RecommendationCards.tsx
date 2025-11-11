'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Clock, DollarSign, Archive } from 'lucide-react';
import { useState } from 'react';
import { SimulateRequest, SimulationResult, simulate, getRecommendations, RecommendationResponse } from '@/lib/api/simulator';
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

function getActionIcon(actionType: string) {
  switch (actionType) {
    case 'offhours':
      return <Clock className="h-5 w-5" />;
    case 'commitment':
      return <DollarSign className="h-5 w-5" />;
    case 'storage':
      return <Archive className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
}

export function RecommendationCards({ resourceIds }: RecommendationCardsProps) {
  // 실제 추천 데이터를 API에서 가져오기
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
    enabled: resourceIds.length > 0, // 리소스가 있을 때만 조회
  });

  if (resourceIds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        리소스를 선택하면 추천 액션을 확인할 수 있습니다.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        추천 액션을 분석하는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        추천 액션을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        현재 추천할 수 있는 액션이 없습니다.
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
          actionType={rec.actionType as 'offhours' | 'commitment' | 'storage'}
          resourceIds={resourceIds}
          icon={getActionIcon(rec.actionType)}
        />
      ))}
    </div>
  );
}


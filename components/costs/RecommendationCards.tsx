'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Clock, DollarSign, Archive, X } from 'lucide-react';
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

  const { isLoading, refetch, data: simulationData } = useQuery({
    queryKey: ['simulation-details', actionType, resourceIds],
    queryFn: async () => {
      const request: SimulateRequest = {
        resourceIds,
        action: actionType,
      };
      const response = await simulate(request);
      return response;
    },
    enabled: false, // 수동 실행
  });

  const handleViewDetails = async () => {
    setShowDetails(true);
    try {
      const result = await refetch();
      if (result.data) {
        setSimulationResults(result.data.scenarios);
      }
    } catch (error) {
      console.error('시뮬레이션 조회 실패:', error);
    }
  };

  const handleSimulate = () => {
    setShowSimulationPanel(true);
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-blue-600 shadow-sm">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight mb-1.5">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-5">
          <div className="pb-2 border-b border-gray-100">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(estimatedSavings, 'KRW')}
            </p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              월 예상 절감액
            </p>
          </div>

          {showDetails && isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
              <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span>시뮬레이션 실행 중...</span>
            </div>
          )}

          {showDetails && !isLoading && simulationResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">시나리오 결과</p>
              {simulationResults.slice(0, 3).map((result, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="font-medium text-sm text-gray-900 mb-1">{result.scenarioName}</p>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">{result.description}</p>
                  <p className="text-xs font-semibold text-blue-600">
                    절감액: {formatCurrency(result.savings, 'KRW')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {showDetails && !isLoading && simulationResults.length === 0 && (
            <div className="text-sm text-gray-500 py-3">
              시뮬레이션 결과가 없습니다.
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              disabled={isLoading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              근거 보기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulate}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              시뮬레이션
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
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">
          리소스를 선택하면 추천 액션을 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <div className="h-8 w-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-600">
          추천 액션을 분석하는 중...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
          <X className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-600 mb-1">
          추천 액션을 불러오는 중 오류가 발생했습니다.
        </p>
        <p className="text-xs text-gray-500">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Archive className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">
          현재 추천할 수 있는 액션이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
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


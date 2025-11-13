'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Clock, DollarSign, Archive, X, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { SimulationResult, getRecommendations, RecommendationResponse } from '@/lib/api/simulator';
import { useQuery } from '@tanstack/react-query';

interface RecommendationCardProps {
  title: string;
  description: string;
  estimatedSavings: number;
  actionType: 'offhours' | 'commitment' | 'storage' | 'rightsizing';
  resourceIds: string[];
  icon: React.ReactNode;
  scenario?: SimulationResult; // 추천 응답에 포함된 시나리오 정보
}

function RecommendationCard({
  title,
  description,
  estimatedSavings,
  actionType,
  resourceIds,
  icon,
  scenario,
}: RecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
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
              {formatCurrency(Math.max(0, estimatedSavings), 'KRW')}
            </p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              월 예상 절감액
            </p>
          </div>

          {showDetails && scenario && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-2">최적화 근거</p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="space-y-2">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm text-gray-900 mb-1">{scenario.scenarioName}</p>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">현재 비용</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(scenario.currentCost, 'KRW')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">변경 후 비용</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(scenario.newCost, 'KRW')}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">예상 절감액</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(Math.max(0, scenario.savings), 'KRW')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 pt-2">
                    <span>리스크: {(scenario.riskScore * 100).toFixed(1)}%</span>
                    <span>우선순위: {scenario.priorityScore.toFixed(0)}</span>
                    <span>확신도: {(scenario.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              {showDetails ? '근거 숨기기' : '근거 보기'}
            </Button>
          </div>
        </div>
      </CardContent>

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
    case 'rightsizing':
      return <TrendingDown className="h-5 w-5" />;
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
          actionType={rec.actionType as 'offhours' | 'commitment' | 'storage' | 'rightsizing'}
          resourceIds={resourceIds}
          icon={getActionIcon(rec.actionType)}
          scenario={rec.scenario}
        />
      ))}
    </div>
  );
}


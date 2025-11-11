'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { SimulateRequest, SimulationResult, simulate, createProposal } from '@/lib/api/simulator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';

interface SimulationPanelProps {
  resourceIds: string[];
  actionType: 'offhours' | 'commitment' | 'storage';
  onClose: () => void;
}

export function SimulationPanel({ resourceIds, actionType, onClose }: SimulationPanelProps) {
  const [params, setParams] = useState<SimulateRequest['params']>(() => {
    // 기본값 설정
    if (actionType === 'offhours') {
      return {
        weekdays: ['Mon-Fri'],
        stopAt: '20:00',
        startAt: '08:30',
        timezone: 'Asia/Seoul',
        scaleToZeroSupported: true,
      };
    } else if (actionType === 'commitment') {
      return {
        commitLevel: 0.7,
        commitYears: 1,
      };
    } else if (actionType === 'storage') {
      return {
        targetTier: 'Cold',
        retentionDays: 90,
      };
    }
    return {};
  });

  const queryClient = useQueryClient();

  const { data: simulationResponse, isLoading, refetch } = useQuery({
    queryKey: ['simulation', actionType, resourceIds, params],
    queryFn: async () => {
      const request: SimulateRequest = {
        resourceIds,
        action: actionType,
        params,
      };
      return await simulate(request);
    },
    enabled: false, // 수동 실행
  });

  const createProposalMutation = useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      alert('제안서가 생성되었습니다.');
      onClose();
    },
  });

  const handleRunSimulation = () => {
    refetch();
  };

  const handleCreateProposal = (scenario: SimulationResult) => {
    createProposalMutation.mutate({
      scenarioId: scenario.scenarioName,
      note: scenario.description,
      ttlDays: 30,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
        <CardHeader className="flex flex-row items-start justify-between pb-5 border-b border-gray-100">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-gray-900">시뮬레이션 실행</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {actionType === 'offhours' && 'Off-hours 스케줄링 시뮬레이션'}
              {actionType === 'commitment' && 'Commitment 최적화 시뮬레이션'}
              {actionType === 'storage' && 'Storage 수명주기 시뮬레이션'}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* 파라미터 입력 */}
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">시뮬레이션 파라미터</h3>
              <p className="text-sm text-gray-500">최적화 시나리오를 위한 설정을 입력하세요</p>
            </div>

            {actionType === 'offhours' && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">중단 시간</Label>
                  <Input
                    type="time"
                    value={params?.stopAt}
                    onChange={(e) => setParams({ ...params, stopAt: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">재시작 시간</Label>
                  <Input
                    type="time"
                    value={params?.startAt}
                    onChange={(e) => setParams({ ...params, startAt: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">요일</Label>
                  <Select
                    value={params?.weekdays?.[0] || 'Mon-Fri'}
                    onValueChange={(value) => setParams({ ...params, weekdays: [value] })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mon-Fri">주중 (월-금)</SelectItem>
                      <SelectItem value="Mon-Sun">매일</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">타임존</Label>
                  <Input
                    value={params?.timezone || 'Asia/Seoul'}
                    onChange={(e) => setParams({ ...params, timezone: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {actionType === 'commitment' && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">커밋 레벨</Label>
                  <Select
                    value={String(params?.commitLevel || 0.7)}
                    onValueChange={(value) => setParams({ ...params, commitLevel: parseFloat(value) })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">50%</SelectItem>
                      <SelectItem value="0.7">70%</SelectItem>
                      <SelectItem value="0.9">90%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">약정 기간 (년)</Label>
                  <Select
                    value={String(params?.commitYears || 1)}
                    onValueChange={(value) => setParams({ ...params, commitYears: parseInt(value) })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1년</SelectItem>
                      <SelectItem value="3">3년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {actionType === 'storage' && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">목표 스토리지 클래스</Label>
                  <Select
                    value={params?.targetTier || 'Cold'}
                    onValueChange={(value) => setParams({ ...params, targetTier: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cold">Cold</SelectItem>
                      <SelectItem value="Archive">Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">보존 기간 (일)</Label>
                  <Select
                    value={String(params?.retentionDays || 90)}
                    onValueChange={(value) => setParams({ ...params, retentionDays: parseInt(value) })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30일</SelectItem>
                      <SelectItem value="60">60일</SelectItem>
                      <SelectItem value="90">90일</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button onClick={handleRunSimulation} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  시뮬레이션 실행 중...
                </>
              ) : (
                '시뮬레이션 실행'
              )}
            </Button>
          </div>

          {/* 결과 표시 */}
          {simulationResponse && (
            <div className="space-y-4">
              <h3 className="font-semibold">시뮬레이션 결과</h3>
              <div className="space-y-3">
                {simulationResponse.scenarios.map((scenario, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{scenario.scenarioName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">현재 비용:</span>
                            <span className="font-medium">{formatCurrency(scenario.currentCost, 'KRW')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">변경 후 비용:</span>
                            <span className="font-medium">{formatCurrency(scenario.newCost, 'KRW')}</span>
                          </div>
                          <div className="flex justify-between text-indigo-600">
                            <span>절감액:</span>
                            <span className="font-bold">{formatCurrency(scenario.savings, 'KRW')}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>리스크 스코어: {(scenario.riskScore * 100).toFixed(1)}%</span>
                            <span>우선순위 점수: {scenario.priorityScore.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCreateProposal(scenario)}
                        disabled={createProposalMutation.isPending}
                        className="ml-4"
                      >
                        제안서 생성
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


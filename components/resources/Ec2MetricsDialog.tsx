'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { getEc2InstanceMetrics } from '@/lib/api/aws';
import { RefreshCw, Cpu, MemoryStick, Network, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Ec2MetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  instanceId: string;
  instanceName: string;
  region?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateStats(values: (number | null)[]) {
  const validValues = values.filter((v): v is number => v !== null && v !== undefined);
  if (validValues.length === 0) {
    return { avg: 0, max: 0, min: 0, current: 0 };
  }
  const sum = validValues.reduce((a, b) => a + b, 0);
  return {
    avg: sum / validValues.length,
    max: Math.max(...validValues),
    min: Math.min(...validValues),
    current: validValues[validValues.length - 1] || 0,
  };
}

export function Ec2MetricsDialog({
  open,
  onOpenChange,
  accountId,
  instanceId,
  instanceName,
  region,
}: Ec2MetricsDialogProps) {
  const [hours, setHours] = useState<number>(1);

  const { data: metrics, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ec2-metrics', accountId, instanceId, hours],
    queryFn: () => getEc2InstanceMetrics(accountId, instanceId, region, hours),
    enabled: open && accountId > 0 && instanceId.length > 0,
    staleTime: 30000, // 30초
  });

  // CPU 차트 데이터 준비
  const cpuChartData = useMemo(() => 
    metrics?.cpuUtilization.map((point) => ({
      time: formatTimestamp(point.timestamp),
      timestamp: point.timestamp,
      value: point.value ?? 0,
    })) ?? [], [metrics?.cpuUtilization]
  );

  // Network 차트 데이터 준비
  const networkChartData = useMemo(() => 
    metrics?.networkIn.map((point, index) => ({
      time: formatTimestamp(point.timestamp),
      timestamp: point.timestamp,
      networkIn: metrics.networkIn[index]?.value ?? 0,
      networkOut: metrics.networkOut[index]?.value ?? 0,
    })) ?? [], [metrics?.networkIn, metrics?.networkOut]
  );

  // Memory 차트 데이터 준비
  const memoryChartData = useMemo(() => 
    metrics?.memoryUtilization.map((point) => ({
      time: formatTimestamp(point.timestamp),
      timestamp: point.timestamp,
      value: point.value ?? 0,
    })) ?? [], [metrics?.memoryUtilization]
  );

  const hasMemoryData = (metrics?.memoryUtilization.length ?? 0) > 0;

  // 통계 계산
  const cpuStats = useMemo(() => 
    calculateStats(metrics?.cpuUtilization.map(p => p.value) ?? []), 
    [metrics?.cpuUtilization]
  );
  const networkInStats = useMemo(() => 
    calculateStats(metrics?.networkIn.map(p => p.value) ?? []), 
    [metrics?.networkIn]
  );
  const networkOutStats = useMemo(() => 
    calculateStats(metrics?.networkOut.map(p => p.value) ?? []), 
    [metrics?.networkOut]
  );
  const memoryStats = useMemo(() => 
    calculateStats(metrics?.memoryUtilization.map(p => p.value) ?? []), 
    [metrics?.memoryUtilization]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 mb-1">
                {instanceName || instanceId}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <span className="font-mono text-xs">{instanceId}</span>
                <span>•</span>
                <span>{region || '기본 리전'}</span>
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          {/* 시간 범위 선택 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">조회 기간:</label>
            <Select
              value={String(hours)}
              onValueChange={(value) => setHours(Number(value))}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">최근 1시간</SelectItem>
                <SelectItem value="3">최근 3시간</SelectItem>
                <SelectItem value="6">최근 6시간</SelectItem>
                <SelectItem value="12">최근 12시간</SelectItem>
                <SelectItem value="24">최근 24시간</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 text-slate-500">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>메트릭 데이터를 불러오는 중입니다...</span>
              </div>
            </div>
          ) : isError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 font-medium">메트릭 데이터를 불러오지 못했습니다.</p>
              </CardContent>
            </Card>
          ) : !metrics ? (
            <Card>
              <CardContent className="p-6 text-center text-slate-500">
                메트릭 데이터가 없습니다.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {/* CPU Utilization */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Cpu className="h-5 w-5 text-blue-600" />
                      </div>
                      CPU 사용률
                    </CardTitle>
                    {cpuChartData.length > 0 && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-slate-600">
                          <span className="text-slate-400">현재:</span>{' '}
                          <span className="font-semibold text-slate-900">{cpuStats.current.toFixed(1)}%</span>
                        </div>
                        <div className="text-slate-600">
                          <span className="text-slate-400">평균:</span>{' '}
                          <span className="font-medium">{cpuStats.avg.toFixed(1)}%</span>
                        </div>
                        <div className="text-slate-600">
                          <span className="text-slate-400">최대:</span>{' '}
                          <span className="font-medium">{cpuStats.max.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {cpuChartData.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      CPU 메트릭 데이터가 없습니다.
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cpuChartData}>
                          <defs>
                            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            dataKey="time"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                            tickMargin={8}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value: number) => [`${value.toFixed(2)}%`, 'CPU 사용률']}
                            labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            fill="url(#cpuGradient)"
                            name="CPU 사용률"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Network In/Out */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Network className="h-5 w-5 text-emerald-600" />
                      </div>
                      네트워크 트래픽
                    </CardTitle>
                    {networkChartData.length > 0 && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-slate-600">
                            <span className="text-slate-400">인바운드:</span>{' '}
                            <span className="font-semibold text-slate-900">{formatBytes(networkInStats.current)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-slate-600">
                            <span className="text-slate-400">아웃바운드:</span>{' '}
                            <span className="font-semibold text-slate-900">{formatBytes(networkOutStats.current)}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {networkChartData.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      네트워크 메트릭 데이터가 없습니다.
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={networkChartData}>
                          <defs>
                            <linearGradient id="networkInGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="networkOutGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            dataKey="time"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => formatBytes(value)}
                            tickMargin={8}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value: number, name: string) => [
                              formatBytes(value),
                              name === 'networkIn' ? '인바운드' : '아웃바운드'
                            ]}
                            labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            formatter={(value) => (
                              <span className="text-sm text-slate-600">
                                {value === 'networkIn' ? '인바운드' : '아웃바운드'}
                              </span>
                            )}
                          />
                          <Area
                            type="monotone"
                            dataKey="networkIn"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="url(#networkInGradient)"
                            name="networkIn"
                          />
                          <Area
                            type="monotone"
                            dataKey="networkOut"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            fill="url(#networkOutGradient)"
                            name="networkOut"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Memory Utilization */}
              {hasMemoryData ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MemoryStick className="h-5 w-5 text-purple-600" />
                        </div>
                        메모리 사용률
                      </CardTitle>
                      {memoryChartData.length > 0 && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-slate-600">
                            <span className="text-slate-400">현재:</span>{' '}
                            <span className="font-semibold text-slate-900">{memoryStats.current.toFixed(1)}%</span>
                          </div>
                          <div className="text-slate-600">
                            <span className="text-slate-400">평균:</span>{' '}
                            <span className="font-medium">{memoryStats.avg.toFixed(1)}%</span>
                          </div>
                          <div className="text-slate-600">
                            <span className="text-slate-400">최대:</span>{' '}
                            <span className="font-medium">{memoryStats.max.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {memoryChartData.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        메모리 메트릭 데이터가 없습니다.
                      </div>
                    ) : (
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={memoryChartData}>
                            <defs>
                              <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                              dataKey="time"
                              stroke="#94a3b8"
                              fontSize={11}
                              tickLine={false}
                              tickMargin={8}
                            />
                            <YAxis
                              stroke="#94a3b8"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `${value}%`}
                              domain={[0, 100]}
                              tickMargin={8}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              }}
                              formatter={(value: number) => [`${value.toFixed(2)}%`, '메모리 사용률']}
                              labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#8b5cf6"
                              strokeWidth={2.5}
                              fill="url(#memoryGradient)"
                              name="메모리 사용률"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


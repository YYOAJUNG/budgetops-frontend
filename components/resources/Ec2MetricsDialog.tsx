'use client';

import { useState } from 'react';
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getEc2InstanceMetrics, AwsEc2Metrics } from '@/lib/api/aws';
import { RefreshCw, Activity, HardDrive, Upload, Download } from 'lucide-react';
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
  const cpuChartData = metrics?.cpuUtilization.map((point) => ({
    time: formatTimestamp(point.timestamp),
    timestamp: point.timestamp,
    value: point.value ?? 0,
  })) ?? [];

  // Network 차트 데이터 준비
  const networkChartData = metrics?.networkIn.map((point, index) => ({
    time: formatTimestamp(point.timestamp),
    timestamp: point.timestamp,
    networkIn: metrics.networkIn[index]?.value ?? 0,
    networkOut: metrics.networkOut[index]?.value ?? 0,
  })) ?? [];

  // Memory 차트 데이터 준비
  const memoryChartData = metrics?.memoryUtilization.map((point) => ({
    time: formatTimestamp(point.timestamp),
    timestamp: point.timestamp,
    value: point.value ?? 0,
  })) ?? [];

  const hasMemoryData = (metrics?.memoryUtilization.length ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            EC2 인스턴스 메트릭: {instanceName}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {instanceId} - {region || '기본 리전'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 시간 범위 선택 및 새로고침 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">조회 기간:</label>
              <Select
                value={String(hours)}
                onValueChange={(value) => setHours(Number(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1시간</SelectItem>
                  <SelectItem value="3">3시간</SelectItem>
                  <SelectItem value="6">6시간</SelectItem>
                  <SelectItem value="12">12시간</SelectItem>
                  <SelectItem value="24">24시간</SelectItem>
                </SelectContent>
              </Select>
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

          {isLoading ? (
            <div className="text-center py-12 text-slate-500">
              메트릭 데이터를 불러오는 중입니다...
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-500">
              메트릭 데이터를 불러오지 못했습니다.
            </div>
          ) : !metrics ? (
            <div className="text-center py-12 text-slate-500">
              메트릭 데이터가 없습니다.
            </div>
          ) : (
            <>
              {/* CPU Utilization */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    CPU 사용률
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cpuChartData.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      CPU 메트릭 데이터가 없습니다.
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cpuChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="time"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                          />
                          <Tooltip
                            formatter={(value: number) => [`${value.toFixed(2)}%`, 'CPU 사용률']}
                            labelStyle={{ color: '#374151' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            name="CPU 사용률"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Network In/Out */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-green-600" />
                    네트워크 트래픽
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {networkChartData.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      네트워크 메트릭 데이터가 없습니다.
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={networkChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="time"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => formatBytes(value)}
                          />
                          <Tooltip
                            formatter={(value: number) => [formatBytes(value), '']}
                            labelStyle={{ color: '#374151' }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="networkIn"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            name="인바운드"
                          />
                          <Line
                            type="monotone"
                            dataKey="networkOut"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            name="아웃바운드"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Memory Utilization */}
              {hasMemoryData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-purple-600" />
                      메모리 사용률
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {memoryChartData.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        메모리 메트릭 데이터가 없습니다.
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={memoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              dataKey="time"
                              stroke="#9ca3af"
                              fontSize={12}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#9ca3af"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `${value}%`}
                              domain={[0, 100]}
                            />
                            <Tooltip
                              formatter={(value: number) => [`${value.toFixed(2)}%`, '메모리 사용률']}
                              labelStyle={{ color: '#374151' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              dot={false}
                              name="메모리 사용률"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!hasMemoryData && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4 text-sm text-amber-800">
                    <p className="font-medium mb-1">메모리 메트릭 정보</p>
                    <p>
                      메모리 사용률 메트릭을 보려면 EC2 인스턴스에 CloudWatch Agent가 설치되어 있어야 합니다.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


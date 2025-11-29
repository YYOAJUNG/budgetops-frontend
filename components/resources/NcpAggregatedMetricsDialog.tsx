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
  Line,
  LineChart,
} from 'recharts';
import { getAggregatedServerMetrics, NcpAggregatedMetrics } from '@/lib/api/ncp';
import { RefreshCw, Cpu, Network, HardDrive, TrendingUp, TrendingDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NcpAggregatedMetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  instanceNos: string[];
  regionCode?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatBits(bits: number): string {
  if (bits === 0) return '0 bps';
  const k = 1000;
  const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  const i = Math.floor(Math.log(bits) / Math.log(k));
  return `${(bits / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
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

export function NcpAggregatedMetricsDialog({
  open,
  onOpenChange,
  accountId,
  instanceNos,
  regionCode,
}: NcpAggregatedMetricsDialogProps) {
  const [hours, setHours] = useState<number>(1);

  const { data: metrics, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ncp-aggregated-metrics', accountId, instanceNos.join(','), hours],
    queryFn: () => getAggregatedServerMetrics(accountId, instanceNos, regionCode, hours),
    enabled: open && accountId > 0 && instanceNos.length > 0,
    staleTime: 30000, // 30초
  });

  // CPU 차트 데이터 준비
  const cpuChartData = useMemo(() => 
    metrics?.cpuUtilization.map((point) => ({
      time: formatTimestamp(point.timestamp),
      timestamp: point.timestamp,
      avg: point.avg ?? 0,
      min: point.min ?? 0,
      max: point.max ?? 0,
    })) ?? [], [metrics?.cpuUtilization]
  );

  // Network 차트 데이터 준비
  const networkChartData = useMemo(() => 
    metrics?.networkIn.map((point, index) => ({
      time: formatTimestamp(point.timestamp),
      timestamp: point.timestamp,
      networkIn: metrics.networkIn[index]?.avg ?? 0,
      networkOut: metrics.networkOut[index]?.avg ?? 0,
    })) ?? [], [metrics?.networkIn, metrics?.networkOut]
  );

  // Disk 차트 데이터 준비
  const diskChartData = useMemo(() => 
    metrics?.diskRead.map((point, index) => ({
      time: formatTimestamp(point.timestamp),
      timestamp: point.timestamp,
      diskRead: metrics.diskRead[index]?.avg ?? 0,
      diskWrite: metrics.diskWrite[index]?.avg ?? 0,
    })) ?? [], [metrics?.diskRead, metrics?.diskWrite]
  );

  // File System 차트 데이터 준비
  const fileSystemChartData = useMemo(() => 
    metrics?.fileSystemUtilization.map((point) => ({
      time: formatTimestamp(point.timestamp),
      timestamp: point.timestamp,
      value: point.avg ?? 0,
    })) ?? [], [metrics?.fileSystemUtilization]
  );

  // 통계 계산
  const cpuStats = useMemo(() => 
    calculateStats(metrics?.cpuUtilization.map(p => p.avg) ?? []), 
    [metrics?.cpuUtilization]
  );
  const networkInStats = useMemo(() => 
    calculateStats(metrics?.networkIn.map(p => p.avg) ?? []), 
    [metrics?.networkIn]
  );
  const networkOutStats = useMemo(() => 
    calculateStats(metrics?.networkOut.map(p => p.avg) ?? []), 
    [metrics?.networkOut]
  );
  const diskReadStats = useMemo(() => 
    calculateStats(metrics?.diskRead.map(p => p.avg) ?? []), 
    [metrics?.diskRead]
  );
  const diskWriteStats = useMemo(() => 
    calculateStats(metrics?.diskWrite.map(p => p.avg) ?? []), 
    [metrics?.diskWrite]
  );
  const fileSystemStats = useMemo(() => 
    calculateStats(metrics?.fileSystemUtilization.map(p => p.avg) ?? []), 
    [metrics?.fileSystemUtilization]
  );

  if (isError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>메트릭 집계 오류</DialogTitle>
            <DialogDescription>
              메트릭 데이터를 불러오는 중 오류가 발생했습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Button onClick={() => refetch()}>다시 시도</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>NCP 서버 메트릭 집계</DialogTitle>
              <DialogDescription>
                {metrics?.totalServers || instanceNos.length}개 서버의 집계된 메트릭 데이터
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={hours.toString()} onValueChange={(v) => setHours(Number(v))}>
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* CPU Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  CPU 사용률 (평균)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">평균</p>
                    <p className="text-2xl font-bold">{cpuStats.avg.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">최대</p>
                    <p className="text-2xl font-bold">{cpuStats.max.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">최소</p>
                    <p className="text-2xl font-bold">{cpuStats.min.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">현재</p>
                    <p className="text-2xl font-bold">{cpuStats.current.toFixed(1)}%</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cpuChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="avg" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="평균" />
                    <Area type="monotone" dataKey="min" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="최소" />
                    <Area type="monotone" dataKey="max" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} name="최대" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Network */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  네트워크 트래픽 (평균)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">인바운드 평균</p>
                    <p className="text-2xl font-bold">{formatBits(networkInStats.avg)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">아웃바운드 평균</p>
                    <p className="text-2xl font-bold">{formatBits(networkOutStats.avg)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">인바운드 최대</p>
                    <p className="text-2xl font-bold">{formatBits(networkInStats.max)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">아웃바운드 최대</p>
                    <p className="text-2xl font-bold">{formatBits(networkOutStats.max)}</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={networkChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="networkIn" stroke="#8884d8" name="인바운드" />
                    <Line type="monotone" dataKey="networkOut" stroke="#82ca9d" name="아웃바운드" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Disk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  디스크 I/O (평균)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">읽기 평균</p>
                    <p className="text-2xl font-bold">{formatBytes(diskReadStats.avg)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">쓰기 평균</p>
                    <p className="text-2xl font-bold">{formatBytes(diskWriteStats.avg)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">읽기 최대</p>
                    <p className="text-2xl font-bold">{formatBytes(diskReadStats.max)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">쓰기 최대</p>
                    <p className="text-2xl font-bold">{formatBytes(diskWriteStats.max)}</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={diskChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="diskRead" stroke="#8884d8" name="읽기" />
                    <Line type="monotone" dataKey="diskWrite" stroke="#82ca9d" name="쓰기" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* File System Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  파일 시스템 사용률 (평균)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">평균</p>
                    <p className="text-2xl font-bold">{fileSystemStats.avg.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">최대</p>
                    <p className="text-2xl font-bold">{fileSystemStats.max.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">최소</p>
                    <p className="text-2xl font-bold">{fileSystemStats.min.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">현재</p>
                    <p className="text-2xl font-bold">{fileSystemStats.current.toFixed(1)}%</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={fileSystemChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="사용률" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


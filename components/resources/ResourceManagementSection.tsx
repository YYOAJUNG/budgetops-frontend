'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getResources, ResourceItem } from '@/lib/api/resources';
import { PROVIDER_COLORS } from '@/constants/mypage';
import {
  getAllEc2Instances,
  AwsEc2Instance,
  getAwsAccounts,
  stopEc2Instance,
  startEc2Instance,
  terminateEc2Instance,
} from '@/lib/api/aws';
import { getAllGcpResources, GcpResource, getGcpAccounts } from '@/lib/api/gcp';
import { getAzureAccounts } from '@/lib/api/azure';
import { getNcpAccounts } from '@/lib/api/ncp';
import { CreateEc2InstanceDialog } from './CreateEc2InstanceDialog';
import { Ec2MetricsDialog } from './Ec2MetricsDialog';
import { GcpInstanceMetricsDialog } from './GcpInstanceMetricsDialog';
import {
  Server,
  Play,
  Square,
  Trash2,
  Plus,
  Activity,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getServiceIcon(service: string) {
  switch (service) {
    case 'EC2':
    case 'Instance':
    case 'Virtual Machines':
      return Server;
    default:
      return Server;
  }
}

function getStatusBadge(status: string) {
  const statusConfig = {
    running: {
      className: 'border-green-200 bg-green-50 text-green-700',
      label: '실행 중',
    },
    stopped: {
      className: 'border-red-200 bg-red-50 text-red-700',
      label: '정지됨',
    },
    idle: {
      className: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      label: '대기 중',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export function ResourceManagementSection() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [showGcpMetricsDialog, setShowGcpMetricsDialog] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<{
    instance: AwsEc2Instance;
    accountId: number;
    region?: string;
  } | null>(null);
  const [selectedGcpResource, setSelectedGcpResource] = useState<{
    resourceId: string;
    instanceName: string;
    region?: string;
  } | null>(null);
  const [operatingInstanceId, setOperatingInstanceId] = useState<string | null>(null);

  const { data: awsAccounts } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
    staleTime: 0, // 항상 최신 데이터 가져오기
    gcTime: 0, // 캐시 시간 최소화
  });

  const { data: gcpAccountsList } = useQuery({
    queryKey: ['gcpAccounts'],
    queryFn: getGcpAccounts,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: azureAccounts } = useQuery({
    queryKey: ['azureAccounts'],
    queryFn: getAzureAccounts,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: ncpAccounts } = useQuery({
    queryKey: ['ncpAccounts'],
    queryFn: getNcpAccounts,
    staleTime: 0,
    gcTime: 0,
  });

  // 활성 계정만 필터링
  const activeAccounts = useMemo(() => {
    return (awsAccounts || []).filter((account) => account.active === true);
  }, [awsAccounts]);

  const hasCloudAccounts = useMemo(() => {
    const hasAws = (awsAccounts?.length ?? 0) > 0;
    const hasGcp = (gcpAccountsList?.length ?? 0) > 0;
    const hasAzure = (azureAccounts?.length ?? 0) > 0;
    const hasNcp = (ncpAccounts?.length ?? 0) > 0;
    return hasAws || hasGcp || hasAzure || hasNcp;
  }, [awsAccounts, gcpAccountsList, azureAccounts, ncpAccounts]);

  const hasAwsAccounts = activeAccounts.length > 0;

  const { data: resources, isLoading, isError, error: resourcesError, refetch, isFetching } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources,
    enabled: hasCloudAccounts,
    retry: 1,
  });

  const { data: ec2Data, refetch: refetchEc2, error: ec2Error } = useQuery({
    queryKey: ['ec2-instances'],
    queryFn: getAllEc2Instances,
    enabled: hasAwsAccounts,
    retry: 1,
  });

  // GCP 리소스 조회
  const { data: gcpAccountResources, refetch: refetchGcp } = useQuery({
    queryKey: ['gcp-resources'],
    queryFn: getAllGcpResources,
    retry: 1,
  });

  // GCP 리소스를 resourceId로 인덱싱된 Map으로 변환
  const gcpResourceMap = useMemo(() => {
    const map = new Map<string, GcpResource>();
    if (gcpAccountResources) {
      for (const accountResources of gcpAccountResources) {
        for (const resource of accountResources.resources) {
          map.set(resource.resourceId, resource);
        }
      }
    }
    return map;
  }, [gcpAccountResources]);

  // 리소스와 EC2 인스턴스 매핑
  const resourcesWithDetails = useMemo(() => {
    if (!resources) return [];

    return resources.map((resource) => {
      const ec2Instance = ec2Data?.find((ec2) => ec2.instanceId === resource.id);
      let accountId: number | null = null;
      if (ec2Instance && activeAccounts.length > 0) {
        // 활성 계정만 사용
        const activeAccount = activeAccounts[0]; // 첫 번째 활성 계정 사용
        accountId = activeAccount.id;
      }

      return {
        resource,
        ec2Instance,
        accountId,
      };
    });
  }, [resources, ec2Data, activeAccounts]);

  const handleStop = async (instance: AwsEc2Instance, accountId: number, region?: string) => {
    if (!confirm(`${instance.name || instance.instanceId} 인스턴스를 정지하시겠습니까?`)) {
      return;
    }
    setOperatingInstanceId(instance.instanceId);
    try {
      await stopEc2Instance(accountId, instance.instanceId, region);
      queryClient.invalidateQueries({ queryKey: ['ec2-instances'] });
      queryClient.invalidateQueries({ queryKey: ['gcp-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    } catch (error: any) {
      console.error('인스턴스 정지 오류:', error);
      alert(error?.response?.data?.message || error?.message || '인스턴스 정지 중 오류가 발생했습니다.');
    } finally {
      setOperatingInstanceId(null);
    }
  };

  const handleStart = async (instance: AwsEc2Instance, accountId: number, region?: string) => {
    setOperatingInstanceId(instance.instanceId);
    try {
      await startEc2Instance(accountId, instance.instanceId, region);
      queryClient.invalidateQueries({ queryKey: ['ec2-instances'] });
      queryClient.invalidateQueries({ queryKey: ['gcp-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    } catch (error: any) {
      console.error('인스턴스 시작 오류:', error);
      alert(error?.response?.data?.message || error?.message || '인스턴스 시작 중 오류가 발생했습니다.');
    } finally {
      setOperatingInstanceId(null);
    }
  };

  const handleTerminate = async (instance: AwsEc2Instance, accountId: number, region?: string) => {
    const instanceName = instance.name || instance.instanceId;
    if (!confirm(`${instanceName} 인스턴스를 삭제하시겠습니까?\n\n삭제된 인스턴스는 복구할 수 없습니다.`)) {
      return;
    }
    setOperatingInstanceId(instance.instanceId);
    try {
      await terminateEc2Instance(accountId, instance.instanceId, region);
      queryClient.invalidateQueries({ queryKey: ['ec2-instances'] });
      queryClient.invalidateQueries({ queryKey: ['gcp-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    } catch (error: any) {
      console.error('인스턴스 삭제 오류:', error);
      alert(error?.response?.data?.message || error?.message || '인스턴스 삭제 중 오류가 발생했습니다.');
    } finally {
      setOperatingInstanceId(null);
    }
  };

  const handleShowMetrics = (instance: AwsEc2Instance, accountId: number, region?: string) => {
    setSelectedInstance({ instance, accountId, region });
    setShowMetricsDialog(true);
  };

  const handleShowGcpMetrics = (resourceId: string, instanceName: string, region?: string) => {
    setSelectedGcpResource({ resourceId, instanceName, region });
    setShowGcpMetricsDialog(true);
  };

  const activeAccount = activeAccounts.length > 0 ? activeAccounts[0] : null;

  if (!hasCloudAccounts) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-blue-100 p-4">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                클라우드 계정을 먼저 연결하세요
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                리소스를 관리하려면 클라우드 계정 연동이 필요합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">리소스 관리</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                보유 중인 서비스 인스턴스를 생성, 중지, 삭제, 재가동할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  refetch();
                  refetchEc2();
                  refetchGcp();
                  queryClient.invalidateQueries({ queryKey: ['ec2-instances'] });
                  queryClient.invalidateQueries({ queryKey: ['gcp-resources'] });
                }}
                disabled={isFetching}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              {/* {activeAccount && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  인스턴스 생성
                </Button>
              )} */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>리소스를 불러오는 중입니다...</p>
            </div>
          ) : (isError || ec2Error) ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <p className="font-semibold text-red-900 mb-1">리소스 데이터 조회 실패</p>
                <p className="text-sm text-red-700 mb-2">
                  {resourcesError instanceof Error ? resourcesError.message : 
                   ec2Error instanceof Error ? ec2Error.message : 
                   '리소스 데이터를 불러오지 못했습니다.'}
                </p>
                <p className="text-xs text-red-600">
                  AWS 계정이 활성화되어 있고 IAM 권한이 올바른지 확인하세요.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetch();
                    refetchEc2();
                    refetchGcp();
                  }}
                  className="mt-3"
                >
                  다시 시도
                </Button>
              </div>
            </div>
          ) : resourcesWithDetails.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Server className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="font-medium mb-1">리소스가 없습니다</p>
              <p className="text-sm">새로운 인스턴스를 생성해보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">서비스</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">이름</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">상태</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">리전</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">업데이트</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {resourcesWithDetails.map(({ resource, ec2Instance, accountId }) => {
                    const ServiceIcon = getServiceIcon(resource.service);
                    const isEc2 = resource.service === 'EC2' && ec2Instance;
                    const isGcpInstance = resource.provider === 'GCP' && resource.service === 'Instance';
                    const gcpResource = isGcpInstance ? gcpResourceMap.get(resource.id) : undefined;
                    const isOperating = operatingInstanceId === resource.id;

                    return (
                      <tr
                        key={resource.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <ServiceIcon className="h-4 w-4 text-slate-500" />
                            <Badge className={PROVIDER_COLORS[resource.provider]}>
                              {resource.provider}
                            </Badge>
                            <span className="text-sm text-slate-600">{resource.service}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-900">{resource.name}</div>
                            {isEc2 && (
                              <div className="text-xs text-slate-500 font-mono mt-1">
                                {ec2Instance.instanceId}
                              </div>
                            )}
                            {resource.provider === 'GCP' && resource.service === 'Instance' && (
                              <div className="text-xs text-slate-500 font-mono mt-1">
                                {resource.id}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(resource.status)}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {isEc2 ? ec2Instance.availabilityZone : resource.region}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {formatDate(resource.updatedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {isEc2 && accountId ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleShowMetrics(ec2Instance, accountId, resource.region)
                                  }
                                  className="h-8 px-2"
                                  title="메트릭 보기"
                                >
                                  <Activity className="h-4 w-4 text-blue-600" />
                                </Button>
                                {ec2Instance.state === 'running' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleStop(ec2Instance, accountId, resource.region)
                                    }
                                    disabled={isOperating}
                                    className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    title="정지"
                                  >
                                    <Square className="h-4 w-4" />
                                  </Button>
                                ) : ec2Instance.state === 'stopped' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleStart(ec2Instance, accountId, resource.region)
                                    }
                                    disabled={isOperating}
                                    className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="시작"
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleTerminate(ec2Instance, accountId, resource.region)
                                  }
                                  disabled={isOperating}
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : isGcpInstance && gcpResource ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleShowGcpMetrics(
                                    gcpResource.resourceId,
                                    gcpResource.resourceName || gcpResource.resourceId,
                                    resource.region
                                  )
                                }
                                className="h-8 px-2"
                                title="메트릭 보기"
                              >
                                <Activity className="h-4 w-4 text-blue-600" />
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-400">관리 불가</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {activeAccount && (
        <CreateEc2InstanceDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          accountId={activeAccount.id}
          account={activeAccount}
          onSuccess={async () => {
            await refetch();
            await refetchEc2();
            await refetchGcp();
            queryClient.invalidateQueries({ queryKey: ['ec2-instances'] });
            queryClient.invalidateQueries({ queryKey: ['gcp-resources'] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
          }}
        />
      )}

      {selectedInstance && (
        <Ec2MetricsDialog
          open={showMetricsDialog}
          onOpenChange={setShowMetricsDialog}
          accountId={selectedInstance.accountId}
          instanceId={selectedInstance.instance.instanceId}
          instanceName={selectedInstance.instance.name || selectedInstance.instance.instanceId}
          region={selectedInstance.region}
        />
      )}

      {selectedGcpResource && (
        <GcpInstanceMetricsDialog
          open={showGcpMetricsDialog}
          onOpenChange={setShowGcpMetricsDialog}
          resourceId={selectedGcpResource.resourceId}
          instanceName={selectedGcpResource.instanceName}
          region={selectedGcpResource.region}
        />
      )}
    </>
  );
}


'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getResources, ResourceItem } from '@/lib/api/resources';
import { 
  getAllEc2Instances, 
  AwsEc2Instance, 
  getAwsAccounts,
  stopEc2Instance,
  startEc2Instance,
  terminateEc2Instance,
} from '@/lib/api/aws';

import { getAllGcpResources, GcpResource } from '@/lib/api/gcp';
import { getAzureAccounts, startAzureVirtualMachine, stopAzureVirtualMachine, deleteAzureVirtualMachine } from '@/lib/api/azure';
import { getNcpAccounts, getAllServerInstances, NcpServerInstance, stopServerInstances, startServerInstances, terminateServerInstances } from '@/lib/api/ncp';
import { Ec2MetricsDialog } from './Ec2MetricsDialog';
import { GcpInstanceMetricsDialog } from './GcpInstanceMetricsDialog';
import { NcpServerMetricsDialog } from './NcpServerMetricsDialog';
import { NcpAggregatedMetricsDialog } from './NcpAggregatedMetricsDialog';
import { AzureVmMetricsDialog } from './AzureVmMetricsDialog';
import { ArrowUpDown, Filter, RefreshCw, Server, AlertCircle, Cloud, Activity, List, Grid, Play, Square, Trash2, BarChart3 } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'cost', label: '비용' },
  { value: 'name', label: '이름' },
  { value: 'updatedAt', label: '업데이트' },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['value'];

type SortOrder = 'asc' | 'desc';

function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ResourceExplorer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // AWS 계정 목록 조회
  const { data: awsAccounts } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
    staleTime: 0, // 항상 최신 데이터 가져오기
    gcTime: 0, // 캐시 시간 최소화
  });

  // Azure 계정 목록 조회
  const { data: azureAccounts } = useQuery({
    queryKey: ['azureAccounts'],
    queryFn: getAzureAccounts,
    staleTime: 0,
    gcTime: 0,
  });

  // NCP 계정 목록 조회
  const { data: ncpAccounts } = useQuery({
    queryKey: ['ncpAccounts'],
    queryFn: getNcpAccounts,
    staleTime: 0,
    gcTime: 0,
  });

  // 활성 계정만 필터링
  const activeAwsAccounts = useMemo(() => {
    return (awsAccounts || []).filter((account) => account.active === true);
  }, [awsAccounts]);

  const activeAzureAccounts = useMemo(() => {
    return (azureAccounts || []).filter((account) => account.active === true);
  }, [azureAccounts]);

  const activeNcpAccounts = useMemo(() => {
    return (ncpAccounts || []).filter((account) => account.active === true);
  }, [ncpAccounts]);

  const hasActiveAccounts =
    activeAwsAccounts.length > 0 ||
    activeAzureAccounts.length > 0 ||
    activeNcpAccounts.length > 0;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources,
    enabled: hasActiveAccounts, // 활성 계정이 있을 때만 조회
    retry: 1,
  });

  // EC2 인스턴스 상세 정보도 함께 조회
  const { data: ec2Data, refetch: refetchEc2, error: ec2Error } = useQuery({
    queryKey: ['ec2-instances'],
    queryFn: getAllEc2Instances,
    enabled: activeAwsAccounts.length > 0, // AWS 활성 계정이 있을 때만 조회
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

  // NCP 서버 인스턴스 조회
  const { data: ncpServerInstances } = useQuery({
    queryKey: ['ncp-server-instances'],
    queryFn: getAllServerInstances,
    enabled: activeNcpAccounts.length > 0,
    retry: 1,
  });

  // NCP 서버 인스턴스를 instanceNo로 인덱싱된 Map으로 변환 (accountId 찾기용)
  const ncpServerInstanceMap = useMemo(() => {
    const map = new Map<string, { instance: NcpServerInstance; accountId: number }>();
    if (ncpServerInstances && ncpAccounts) {
      // 각 계정별로 인스턴스를 조회하여 accountId 매핑
      // getAllServerInstances는 모든 계정의 인스턴스를 반환하지만 accountId 정보가 없음
      // 따라서 각 계정별로 조회하여 매핑
      for (const account of activeNcpAccounts) {
        // 인스턴스 번호로 매칭 (실제로는 백엔드에서 accountId를 포함하도록 수정하는 것이 좋음)
        // 여기서는 간단하게 첫 번째 활성 계정을 사용
      }
    }
    return map;
  }, [ncpServerInstances, ncpAccounts, activeNcpAccounts]);

  const [providerFilter, setProviderFilter] = useState<string[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewType, setViewType] = useState<'list' | 'card'>('card');
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [showGcpMetricsDialog, setShowGcpMetricsDialog] = useState(false);
  const [showNcpMetricsDialog, setShowNcpMetricsDialog] = useState(false);
  const [showNcpAggregatedMetricsDialog, setShowNcpAggregatedMetricsDialog] = useState(false);
  const [showAzureMetricsDialog, setShowAzureMetricsDialog] = useState(false);
  const [selectedNcpInstanceNos, setSelectedNcpInstanceNos] = useState<string[]>([]);
  const [selectedNcpAccountId, setSelectedNcpAccountId] = useState<number | null>(null);
  const [selectedNcpRegion, setSelectedNcpRegion] = useState<string | undefined>(undefined);
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
  const [selectedAzureVm, setSelectedAzureVm] = useState<{
    accountId: number;
    vmName: string;
    resourceGroup: string;
    region?: string;
    displayName: string;
  } | null>(null);
  const [selectedNcpInstance, setSelectedNcpInstance] = useState<{
    instanceNo: string;
    instanceName: string;
    accountId: number;
    region?: string;
  } | null>(null);
  const [operatingInstanceId, setOperatingInstanceId] = useState<string | null>(null);
  const [operatingAzureVmId, setOperatingAzureVmId] = useState<string | null>(null);

  const providers = useMemo(() => {
    return Array.from(new Set((data ?? []).map((item) => item.provider))).sort();
  }, [data]);

  const services = useMemo(() => {
    return Array.from(new Set((data ?? []).map((item) => item.service))).sort();
  }, [data]);

  const filteredResources = useMemo(() => {
    if (!data) return [];
    const filtered = data.filter((item) => {
      const providerMatch =
        providerFilter.length === 0 || providerFilter.includes(item.provider);
      const serviceMatch =
        serviceFilter.length === 0 || serviceFilter.includes(item.service);
      return providerMatch && serviceMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      let compare = 0;
      switch (sortKey) {
        case 'cost':
          compare = a.cost - b.cost;
          break;
        case 'name':
          compare = a.name.localeCompare(b.name, 'ko');
          break;
        case 'updatedAt':
          compare = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? compare : -compare;
    });

    return sorted;
  }, [data, providerFilter, serviceFilter, sortKey, sortOrder]);

  const toggleFilter = (value: string, list: string[], setter: (values: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

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
      refetch();
      refetchEc2();
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
      refetch();
      refetchEc2();
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
      refetch();
      refetchEc2();
    } catch (error: any) {
      console.error('인스턴스 삭제 오류:', error);
      alert(error?.response?.data?.message || error?.message || '인스턴스 삭제 중 오류가 발생했습니다.');
    } finally {
      setOperatingInstanceId(null);
    }
  };

  const handleAzureStart = async (resource: ResourceItem) => {
    if (
      resource.provider !== 'Azure' ||
      !resource.accountId ||
      !resource.details ||
      resource.details.provider !== 'Azure'
    ) {
      alert('Azure VM 정보를 찾을 수 없습니다.');
      return;
    }
    setOperatingAzureVmId(resource.id);
    try {
      await startAzureVirtualMachine(resource.accountId, resource.name, resource.details.resourceGroup);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['azureAccounts'] });
    } catch (error: any) {
      console.error('Azure VM 시작 오류:', error);
      alert(error?.response?.data?.message || error?.message || 'Azure VM 시작 중 오류가 발생했습니다.');
    } finally {
      setOperatingAzureVmId(null);
    }
  };

  const handleAzureStop = async (resource: ResourceItem) => {
    if (
      resource.provider !== 'Azure' ||
      !resource.accountId ||
      !resource.details ||
      resource.details.provider !== 'Azure'
    ) {
      alert('Azure VM 정보를 찾을 수 없습니다.');
      return;
    }
    if (!confirm(`${resource.name} VM을 정지하시겠습니까?`)) {
      return;
    }
    setOperatingAzureVmId(resource.id);
    try {
      await stopAzureVirtualMachine(resource.accountId, resource.name, resource.details.resourceGroup);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['azureAccounts'] });
    } catch (error: any) {
      console.error('Azure VM 정지 오류:', error);
      alert(error?.response?.data?.message || error?.message || 'Azure VM 정지 중 오류가 발생했습니다.');
    } finally {
      setOperatingAzureVmId(null);
    }
  };

  const handleAzureDelete = async (resource: ResourceItem) => {
    if (
      resource.provider !== 'Azure' ||
      !resource.accountId ||
      !resource.details ||
      resource.details.provider !== 'Azure'
    ) {
      alert('Azure VM 정보를 찾을 수 없습니다.');
      return;
    }

    if (!confirm(`${resource.name} VM을 삭제하시겠습니까?\n\n삭제된 VM은 복구할 수 없습니다.`)) {
      return;
    }

    setOperatingAzureVmId(resource.id);
    try {
      await deleteAzureVirtualMachine(resource.accountId, resource.name, resource.details.resourceGroup);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['azureAccounts'] });
    } catch (error: any) {
      console.error('Azure VM 삭제 오류:', error);
      alert(error?.response?.data?.message || error?.message || 'Azure VM 삭제 중 오류가 발생했습니다.');
    } finally {
      setOperatingAzureVmId(null);
    }
  };

  const handleNcpStart = async (resource: ResourceItem, accountId: number | null) => {
    if (!accountId) return;

    setOperatingInstanceId(resource.id);
    try {
      await startServerInstances(accountId, [resource.id], resource.region);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['ncp-server-instances'] });
    } catch (error: any) {
      console.error('NCP 서버 시작 오류:', error);
      alert(error?.response?.data?.message || error?.message || '서버 시작 중 오류가 발생했습니다.');
    } finally {
      setOperatingInstanceId(null);
    }
  };

  const handleNcpStop = async (resource: ResourceItem, accountId: number | null) => {
    if (!accountId) return;

    if (!confirm(`${resource.name} 서버 인스턴스를 정지하시겠습니까?`)) {
      return;
    }

    setOperatingInstanceId(resource.id);
    try {
      await stopServerInstances(accountId, [resource.id], resource.region);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['ncp-server-instances'] });
    } catch (error: any) {
      console.error('NCP 서버 정지 오류:', error);
      alert(error?.response?.data?.message || error?.message || '서버 정지 중 오류가 발생했습니다.');
    } finally {
      setOperatingInstanceId(null);
    }
  };

  const handleNcpTerminate = async (resource: ResourceItem, accountId: number | null) => {
    if (!accountId) return;

    const instanceName = resource.name || resource.id;
    if (!confirm(`${instanceName} 서버 인스턴스를 삭제하시겠습니까?\n\n삭제된 서버는 복구할 수 없습니다.`)) {
      return;
    }

    setOperatingInstanceId(resource.id);
    try {
      await terminateServerInstances(accountId, [resource.id], resource.region);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['ncp-server-instances'] });
    } catch (error: any) {
      console.error('NCP 서버 삭제 오류:', error);
      alert(error?.response?.data?.message || error?.message || '서버 삭제 중 오류가 발생했습니다.');
    } finally {
      setOperatingInstanceId(null);
    }
  };

  const handleShowAzureMetrics = (resource: ResourceItem) => {
    if (
      resource.provider !== 'Azure' ||
      !resource.accountId ||
      !resource.details ||
      resource.details.provider !== 'Azure'
    ) {
      alert('Azure VM 정보를 찾을 수 없습니다.');
      return;
    }
    if (!resource.details.resourceGroup || resource.details.resourceGroup.trim() === '') {
      alert('Azure VM의 리소스 그룹 정보가 없습니다. VM 정보를 새로고침해주세요.');
      console.error('Azure VM resourceGroup is missing:', {
        vmName: resource.name,
        accountId: resource.accountId,
        details: resource.details,
      });
      return;
    }
    setSelectedAzureVm({
      accountId: resource.accountId,
      vmName: resource.name,
      resourceGroup: resource.details.resourceGroup.trim(),
      region: resource.region,
      displayName: resource.name,
    });
    setShowAzureMetricsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* 필터 및 정렬 섹션 */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-800">필터 및 정렬</CardTitle>
            {selectedNcpInstanceNos.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (selectedNcpAccountId) {
                    setShowNcpAggregatedMetricsDialog(true);
                  }
                }}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                집계 메트릭 보기 ({selectedNcpInstanceNos.length}개)
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  클라우드
                  {providerFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {providerFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>클라우드 선택</DropdownMenuLabel>
                {providers.map((provider) => (
                  <DropdownMenuCheckboxItem
                    key={provider}
                    checked={providerFilter.includes(provider)}
                    onCheckedChange={() => toggleFilter(provider, providerFilter, setProviderFilter)}
                  >
                    {provider}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  서비스
                  {serviceFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {serviceFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>서비스 선택</DropdownMenuLabel>
                {services.map((service) => (
                  <DropdownMenuCheckboxItem
                    key={service}
                    checked={serviceFilter.includes(service)}
                    onCheckedChange={() => toggleFilter(service, serviceFilter, setServiceFilter)}
                  >
                    {service}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={sortKey} onValueChange={(value: SortKey) => setSortKey(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="gap-1"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'asc' ? '오름차순' : '내림차순'}
            </Button>

            {(providerFilter.length > 0 || serviceFilter.length > 0) && (
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-700"
                onClick={() => {
                  setProviderFilter([]);
                  setServiceFilter([]);
                }}
              >
                필터 초기화
              </Button>
            )}

            {/* 뷰 타입 선택 */}
            <div className="ml-auto flex items-center gap-1 border border-slate-200 rounded-md p-1">
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => setViewType('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => setViewType('card')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
              onClick={() => {
                refetch();
                refetchEc2();
                refetchGcp();
                queryClient.invalidateQueries({ queryKey: ['ec2-instances'] });
                queryClient.invalidateQueries({ queryKey: ['gcp-resources'] });
                queryClient.invalidateQueries({ queryKey: ['azureAccounts'] });
                queryClient.invalidateQueries({ queryKey: ['awsAccounts'] });
              }}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>총 {filteredResources.length}개의 리소스</span>
        {providerFilter.length + serviceFilter.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {providerFilter.map((provider) => (
              <Badge
                key={`provider-${provider}`}
                variant="outline"
                className={
                  provider === 'AWS'
                    ? 'border-orange-200 bg-orange-50 text-orange-800'
                    : provider === 'GCP'
                    ? 'border-blue-200 bg-blue-50 text-blue-800'
                    : provider === 'NCP'
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-sky-200 bg-sky-50 text-sky-800'
                }
              >
                {provider}
              </Badge>
            ))}
            {serviceFilter.map((service) => (
              <Badge
                key={`service-${service}`}
                variant="outline"
                className="border-indigo-200 bg-indigo-50 text-indigo-800"
              >
                {service}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {!hasActiveAccounts ? (
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
                  리소스를 조회하려면 AWS, Azure, GCP 계정 연동이 필요합니다.
                  <br />
                  계정을 연결하면 EC2 인스턴스, Virtual Machines 등 리소스를 자동으로 조회할 수 있습니다.
                </p>
                <Button
                  onClick={() => router.push('/mypage?addCloudAccount=1')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Cloud className="mr-2 h-4 w-4" />
                  계정 연결하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-6 text-slate-600">리소스를 불러오는 중입니다...</CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-red-600">리소스 데이터를 불러오지 못했습니다.</CardContent>
        </Card>
      ) : filteredResources.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-500">
            선택한 조건에 맞는 리소스가 없습니다.
          </CardContent>
        </Card>
      ) : viewType === 'list' ? (
        // 리스트형 뷰
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">서비스</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">이름</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">상태</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">리전</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">업데이트</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((resource) => {
                    const ec2Instance = ec2Data?.find((ec2) => ec2.instanceId === resource.id);
                    let accountId: number | null = null;
                    if (ec2Instance && awsAccounts && awsAccounts.length > 0) {
                      const activeAccount = awsAccounts.find(acc => acc.active);
                      if (activeAccount) {
                        accountId = activeAccount.id;
                      }
                    }
                    const gcpResource = resource.provider === 'GCP' ? gcpResourceMap.get(resource.id) : undefined;
                    const isEc2 = resource.service === 'EC2' && ec2Instance;
                    const isGcpInstance = resource.provider === 'GCP' && resource.service === 'Instance' && gcpResource;
                    const isNcpServer = resource.provider === 'NCP' && resource.service === 'Server';
                    const isAzureVm = resource.provider === 'Azure' && resource.service === 'Virtual Machines';
                    const azureDetails =
                      resource.provider === 'Azure' && resource.details?.provider === 'Azure'
                        ? resource.details
                        : undefined;
                    const isAzureOperating = operatingAzureVmId === resource.id;
                    // NCP 서버의 경우 첫 번째 활성 계정 사용 (실제로는 백엔드에서 accountId를 포함하도록 수정하는 것이 좋음)
                    const ncpAccountId = isNcpServer && activeNcpAccounts.length > 0 ? activeNcpAccounts[0].id : null;
                    const isNcpSelected = isNcpServer ? selectedNcpInstanceNos.includes(resource.id) : false;
                    
                    return (
                      <tr
                        key={resource.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-slate-500" />
                            <Badge className={
                              resource.provider === 'AWS' 
                                ? 'bg-orange-100 text-orange-700'
                                : resource.provider === 'GCP'
                                ? 'bg-blue-100 text-blue-700'
                                : resource.provider === 'NCP'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-sky-100 text-sky-700'
                            }>{resource.provider}</Badge>
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
                            {isGcpInstance && (
                              <div className="text-xs text-slate-500 font-mono mt-1">
                                {resource.id}
                              </div>
                            )}
                            {isNcpServer && (
                              <div className="text-xs text-slate-500 font-mono mt-1">
                                {resource.id}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant="outline" 
                            className={
                              resource.status === 'running' 
                                ? 'border-green-200 bg-green-50 text-green-700' 
                                : resource.status === 'stopped'
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            }
                          >
                            {resource.status === 'running' ? '실행 중' : resource.status === 'stopped' ? '정지됨' : '대기 중'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {isEc2 ? ec2Instance.availabilityZone : resource.region}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {formatDate(resource.updatedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {isEc2 && accountId && ec2Instance ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInstance({ instance: ec2Instance, accountId, region: resource.region });
                                    setShowMetricsDialog(true);
                                  }}
                                  className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="메트릭 보기"
                                >
                                  <Activity className="h-4 w-4" />
                                </Button>
                                {ec2Instance.state === 'running' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStop(ec2Instance, accountId, resource.region)}
                                    disabled={operatingInstanceId === ec2Instance.instanceId}
                                    className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    title="정지"
                                  >
                                    <Square className="h-4 w-4" />
                                  </Button>
                                ) : ec2Instance.state === 'stopped' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStart(ec2Instance, accountId, resource.region)}
                                    disabled={operatingInstanceId === ec2Instance.instanceId}
                                    className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="시작"
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTerminate(ec2Instance, accountId, resource.region)}
                                  disabled={operatingInstanceId === ec2Instance.instanceId}
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : isAzureVm && resource.accountId && azureDetails?.resourceGroup ? (
                              <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShowAzureMetrics(resource)}
                                    className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="메트릭 보기"
                                  >
                                    <Activity className="h-4 w-4" />
                                  </Button>
                                  {resource.status === 'running' ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAzureStop(resource)}
                                      disabled={isAzureOperating}
                                      className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                      title="정지"
                                    >
                                      <Square className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAzureStart(resource)}
                                      disabled={isAzureOperating}
                                      className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title="시작"
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAzureDelete(resource)}
                                  disabled={isAzureOperating}
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : isNcpServer && ncpAccountId ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedNcpInstance({
                                      instanceNo: resource.id,
                                      instanceName: resource.name,
                                      accountId: ncpAccountId,
                                      region: resource.region,
                                    });
                                    setShowNcpMetricsDialog(true);
                                  }}
                                  className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="메트릭 보기"
                                >
                                  <Activity className="h-4 w-4" />
                                </Button>
                                {resource.status === 'running' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNcpStop(resource, ncpAccountId)}
                                    disabled={operatingInstanceId === resource.id}
                                    className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    title="정지"
                                  >
                                    <Square className="h-4 w-4" />
                                  </Button>
                                ) : resource.status === 'stopped' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNcpStart(resource, ncpAccountId)}
                                    disabled={operatingInstanceId === resource.id}
                                    className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="시작"
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleNcpTerminate(resource, ncpAccountId)}
                                  disabled={operatingInstanceId === resource.id}
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
                                onClick={() => {
                                  setSelectedGcpResource({
                                    resourceId: gcpResource.resourceId,
                                    instanceName: gcpResource.resourceName || gcpResource.resourceId,
                                    region: resource.region
                                  });
                                  setShowGcpMetricsDialog(true);
                                }}
                                className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="메트릭 보기"
                              >
                                <Activity className="h-4 w-4" />
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
          </CardContent>
        </Card>
      ) : (
        // 카드형 뷰
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => {
            // EC2 리소스인 경우 상세 정보 찾기
            const ec2Instance = ec2Data?.find((ec2) => ec2.instanceId === resource.id);
            // EC2 인스턴스의 accountId 찾기
            // 실제로는 백엔드에서 인스턴스 조회 시 accountId를 포함하도록 수정하는 것이 가장 좋지만,
            // 현재는 첫 번째 활성 계정을 사용 (대부분의 사용자는 하나의 계정만 사용)
            let accountId: number | null = null;
            if (ec2Instance && awsAccounts && awsAccounts.length > 0) {
              // 첫 번째 활성 계정 사용
              const activeAccount = awsAccounts.find(acc => acc.active);
              if (activeAccount) {
                accountId = activeAccount.id;
              }
            }
            // GCP 리소스인 경우 상세 정보 찾기
            const gcpResource = resource.provider === 'GCP' ? gcpResourceMap.get(resource.id) : undefined;
            // NCP 서버 인스턴스 상세 정보 찾기
            const isNcpServer = resource.provider === 'NCP' && resource.service === 'Server';
            const ncpInstance = isNcpServer
              ? ncpServerInstances?.find((ncp) => ncp.serverInstanceNo === resource.id)
              : undefined;
            // NCP 서버의 경우 첫 번째 활성 계정 사용 (실제로는 백엔드에서 accountId를 포함하도록 수정하는 것이 좋음)
            const ncpAccountId = isNcpServer && activeNcpAccounts.length > 0 ? activeNcpAccounts[0].id : null;
            const isNcpSelected = isNcpServer ? selectedNcpInstanceNos.includes(resource.id) : false;
            
            return (
              <ResourceCard
                key={resource.id}
                resource={resource}
                ec2Instance={ec2Instance}
                gcpResource={gcpResource}
                ncpInstance={ncpInstance}
                accountId={accountId}
                region={resource.region}
                ncpAccountId={ncpAccountId}
                isNcpSelected={isNcpSelected}
                onNcpSelectChange={ncpAccountId ? (checked: boolean) => {
                  if (checked) {
                    setSelectedNcpInstanceNos([...selectedNcpInstanceNos, resource.id]);
                    setSelectedNcpAccountId(ncpAccountId);
                    setSelectedNcpRegion(resource.region);
                  } else {
                    setSelectedNcpInstanceNos(selectedNcpInstanceNos.filter(id => id !== resource.id));
                    if (selectedNcpInstanceNos.length === 1) {
                      setSelectedNcpAccountId(null);
                      setSelectedNcpRegion(undefined);
                    }
                  }
                } : undefined}
                onNcpMetricsClick={ncpAccountId ? () => {
                  setSelectedNcpInstance({
                    instanceNo: resource.id,
                    instanceName: resource.name,
                    accountId: ncpAccountId,
                    region: resource.region,
                  });
                  setShowNcpMetricsDialog(true);
                } : undefined}
                onNcpStart={handleNcpStart}
                onNcpStop={handleNcpStop}
                onNcpTerminate={handleNcpTerminate}
              />
            );
          })}
        </div>
      )}

      {/* 메트릭 다이얼로그 */}
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
      {selectedAzureVm && (
        <AzureVmMetricsDialog
          open={showAzureMetricsDialog}
          onOpenChange={setShowAzureMetricsDialog}
          accountId={selectedAzureVm.accountId}
          vmName={selectedAzureVm.vmName}
          resourceGroup={selectedAzureVm.resourceGroup}
          displayName={selectedAzureVm.displayName}
          region={selectedAzureVm.region}
        />
      )}
      {selectedNcpInstance && (
        <NcpServerMetricsDialog
          open={showNcpMetricsDialog}
          onOpenChange={setShowNcpMetricsDialog}
          accountId={selectedNcpInstance.accountId}
          instanceNo={selectedNcpInstance.instanceNo}
          instanceName={selectedNcpInstance.instanceName}
          region={selectedNcpInstance.region}
        />
      )}
      {selectedNcpAccountId && selectedNcpInstanceNos.length > 0 && (
        <NcpAggregatedMetricsDialog
          open={showNcpAggregatedMetricsDialog}
          onOpenChange={setShowNcpAggregatedMetricsDialog}
          accountId={selectedNcpAccountId}
          instanceNos={selectedNcpInstanceNos}
          regionCode={selectedNcpRegion}
        />
      )}
    </div>
  );
}

function ResourceCard({
  resource,
  ec2Instance,
  gcpResource,
  ncpInstance,
  accountId,
  region,
  ncpAccountId,
  isNcpSelected,
  onNcpSelectChange,
  onNcpMetricsClick,
  onNcpStart,
  onNcpStop,
  onNcpTerminate,
}: {
  resource: ResourceItem;
  ec2Instance?: AwsEc2Instance;
  gcpResource?: GcpResource;
  ncpInstance?: NcpServerInstance;
  accountId?: number | null;
  region?: string;
  ncpAccountId?: number | null;
  isNcpSelected?: boolean;
  onNcpSelectChange?: (checked: boolean) => void;
  onNcpMetricsClick?: () => void;
  onNcpStart?: (resource: ResourceItem, accountId: number | null) => void;
  onNcpStop?: (resource: ResourceItem, accountId: number | null) => void;
  onNcpTerminate?: (resource: ResourceItem, accountId: number | null) => void;
}) {
  const [showMetrics, setShowMetrics] = useState(false);
  const [showGcpMetrics, setShowGcpMetrics] = useState(false);
  const [showAzureMetrics, setShowAzureMetrics] = useState(false);
  const isEc2 = resource.service === 'EC2' && ec2Instance;
  const isGcpInstance = resource.provider === 'GCP' && resource.service === 'Instance' && gcpResource;
  const isNcpServer = resource.provider === 'NCP' && resource.service === 'Server' && ncpAccountId;
  const azureDetails =
    resource.provider === 'Azure' && resource.details && resource.details.provider === 'Azure'
      ? resource.details
      : undefined;
  const canShowAzureMetrics = resource.provider === 'Azure' && !!azureDetails && !!resource.accountId;

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={
              resource.provider === 'AWS' 
                ? 'bg-orange-100 text-orange-700'
                : resource.provider === 'GCP'
                ? 'bg-blue-100 text-blue-700'
                : resource.provider === 'NCP'
                ? 'bg-green-100 text-green-700'
                : 'bg-sky-100 text-sky-700'
            }>{resource.provider}</Badge>
            <div className="flex items-center gap-1">
              {isEc2 && <Server className="h-3 w-3 text-slate-500" />}
              <span className="text-xs uppercase tracking-wide text-slate-500">{resource.service}</span>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={
              resource.status === 'running' 
                ? 'border-green-200 bg-green-50 text-green-700' 
                : resource.status === 'stopped'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-yellow-200 bg-yellow-50 text-yellow-700'
            }
          >
            {resource.status}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {resource.name}
        </CardTitle>
        {isEc2 && (
          <div className="text-xs text-slate-500 font-mono">
            {ec2Instance.instanceId}
          </div>
        )}
        {isGcpInstance && (
          <div className="text-xs text-slate-500 font-mono">
            {gcpResource.resourceId}
          </div>
        )}
        {azureDetails && (
          <div className="text-xs text-slate-500 font-mono truncate">
            {resource.id}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        {isEc2 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">인스턴스 타입</span>
              <span className="font-medium text-slate-900">{ec2Instance.instanceType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">퍼블릭 IP</span>
              <span className="font-mono text-xs text-slate-700">
                {ec2Instance.publicIp || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">프라이빗 IP</span>
              <span className="font-mono text-xs text-slate-700">
                {ec2Instance.privateIp || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">가용 영역</span>
              <span className="font-medium text-slate-700">
                {ec2Instance.availabilityZone}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">시작 시간</span>
              <span className="font-medium text-slate-700">{formatDate(resource.updatedAt)}</span>
            </div>
          </>
        )}
        {azureDetails && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">인스턴스 타입</span>
              <span className="font-medium text-slate-900">{azureDetails.vmSize || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">퍼블릭 IP</span>
              <span className="font-mono text-xs text-slate-700">
                {azureDetails.publicIp || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">프라이빗 IP</span>
              <span className="font-mono text-xs text-slate-700">
                {azureDetails.privateIp || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">시작 시간</span>
              <span className="font-medium text-slate-700">
                {azureDetails.timeCreated ? formatDate(azureDetails.timeCreated) : 'N/A'}
              </span>
            </div>
          </>
        )}
        {isGcpInstance && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">인스턴스 타입</span>
              <span className="font-medium text-slate-900">
                {gcpResource.additionalAttributes?.machineType || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">퍼블릭 IP</span>
              <span className="font-mono text-xs text-slate-700">
                {gcpResource.additionalAttributes?.externalIPs?.[0] || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">프라이빗 IP</span>
              <span className="font-mono text-xs text-slate-700">
                {gcpResource.additionalAttributes?.internalIPs?.[0] || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">가용 영역</span>
              <span className="font-medium text-slate-700">
                {resource.region}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">업데이트</span>
              <span className="font-medium text-slate-700">{formatDate(resource.updatedAt)}</span>
            </div>
          </>
        )}
        {isNcpServer && ncpInstance && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">서버 상품</span>
              <span className="font-medium text-slate-900 text-xs">
                {ncpInstance.serverProductCode || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">CPU / 메모리</span>
              <span className="font-medium text-slate-900">
                {ncpInstance.cpuCount}코어 / {(ncpInstance.memorySize / (1024 * 1024 * 1024)).toFixed(0)}GB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">플랫폼</span>
              <span className="font-medium text-slate-900">
                {ncpInstance.platformType || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">퍼블릭 IP</span>
              <span className="font-mono text-xs text-slate-700">
                {ncpInstance.publicIp || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">프라이빗 IP</span>
              <span className="font-mono text-xs text-slate-700">
                {ncpInstance.privateIp || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">가용 영역</span>
              <span className="font-medium text-slate-700">
                {ncpInstance.zoneCode || ncpInstance.regionCode || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">생성 시간</span>
              <span className="font-medium text-slate-700">
                {ncpInstance.createDate ? formatDate(ncpInstance.createDate) : 'N/A'}
              </span>
            </div>
          </>
        )}
        {!isEc2 && !isGcpInstance && !isNcpServer && !azureDetails && (
          <>
            {resource.cost > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">월간 비용</span>
                <span className="text-base font-semibold text-slate-900">{formatCurrency(resource.cost)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">리전</span>
              <span className="font-medium text-slate-700">
                {resource.region}
              </span>
            </div>
            {resource.provider !== 'Azure' && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">업데이트</span>
              <span className="font-medium text-slate-700">{formatDate(resource.updatedAt)}</span>
            </div>
            )}
          </>
        )}
        {((isEc2 && accountId) || isGcpInstance || canShowAzureMetrics || isNcpServer) && (
          <div className="pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                if (isEc2) {
                  setShowMetrics(true);
                } else if (isGcpInstance) {
                  setShowGcpMetrics(true);
                } else if (canShowAzureMetrics) {
                  setShowAzureMetrics(true);
                } else if (isNcpServer && onNcpMetricsClick) {
                  onNcpMetricsClick();
                }
              }}
            >
              <Activity className="mr-2 h-4 w-4" />
              메트릭 보기
            </Button>
          </div>
        )}
      </CardContent>
      {isEc2 && accountId && ec2Instance && (
        <Ec2MetricsDialog
          open={showMetrics}
          onOpenChange={setShowMetrics}
          accountId={accountId}
          instanceId={ec2Instance.instanceId}
          instanceName={ec2Instance.name || ec2Instance.instanceId}
          region={region}
        />
      )}
      {isGcpInstance && gcpResource && (
        <GcpInstanceMetricsDialog
          open={showGcpMetrics}
          onOpenChange={setShowGcpMetrics}
          resourceId={gcpResource.resourceId}
          instanceName={gcpResource.resourceName || gcpResource.resourceId}
          region={region}
        />
      )}
      {canShowAzureMetrics && resource.accountId && azureDetails && (
        <AzureVmMetricsDialog
          open={showAzureMetrics}
          onOpenChange={setShowAzureMetrics}
          accountId={resource.accountId}
          vmName={resource.name}
          resourceGroup={azureDetails.resourceGroup}
          displayName={resource.name}
          region={region}
        />
      )}
    </Card>
  );
}

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
} from '@/lib/api/aws';
import { ResourceManagementSection } from './ResourceManagementSection';
import { Ec2MetricsDialog } from './Ec2MetricsDialog';
import { ArrowUpDown, Filter, RefreshCw, Server, AlertCircle, Cloud, Activity } from 'lucide-react';

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
  
  // 활성 계정만 필터링
  const activeAccounts = useMemo(() => {
    return (awsAccounts || []).filter((account) => account.active === true);
  }, [awsAccounts]);
  
  const hasAwsAccounts = activeAccounts.length > 0;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources,
    enabled: hasAwsAccounts, // 활성 계정이 있을 때만 조회
    retry: 1,
  });

  // EC2 인스턴스 상세 정보도 함께 조회
  const { data: ec2Data, refetch: refetchEc2, error: ec2Error } = useQuery({
    queryKey: ['ec2-instances'],
    queryFn: getAllEc2Instances,
    enabled: hasAwsAccounts, // 활성 계정이 있을 때만 조회
    retry: 1,
  });

  const [providerFilter, setProviderFilter] = useState<string[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

  return (
    <div className="space-y-6">
      <ResourceManagementSection />

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800">필터 및 정렬</CardTitle>
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

            <Button
              variant="ghost"
              className="ml-auto flex items-center gap-2 text-slate-500 hover:text-slate-700"
              onClick={() => {
                refetch();
                refetchEc2();
                queryClient.invalidateQueries({ queryKey: ['ec2-instances'] });
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
                className="border-sky-200 bg-sky-50 text-sky-800"
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

      {!hasAwsAccounts ? (
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
                  리소스를 조회하려면 AWS 계정 연동이 필요합니다.
                  <br />
                  계정을 연결하면 EC2 인스턴스 등 리소스를 자동으로 조회할 수 있습니다.
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
      ) : (
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
            return (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                ec2Instance={ec2Instance}
                accountId={accountId}
                region={resource.region}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ 
  resource, 
  ec2Instance,
  accountId,
  region
}: { 
  resource: ResourceItem;
  ec2Instance?: AwsEc2Instance;
  accountId?: number | null;
  region?: string;
}) {
  const [showMetrics, setShowMetrics] = useState(false);
  const isEc2 = resource.service === 'EC2' && ec2Instance;

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-100 text-sky-700">{resource.provider}</Badge>
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
          </>
        )}
        {resource.cost > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">월간 비용</span>
            <span className="text-base font-semibold text-slate-900">{formatCurrency(resource.cost)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">{isEc2 ? '가용 영역' : '리전'}</span>
          <span className="font-medium text-slate-700">
            {isEc2 ? ec2Instance.availabilityZone : resource.region}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">{isEc2 ? '시작 시간' : '업데이트'}</span>
          <span className="font-medium text-slate-700">{formatDate(resource.updatedAt)}</span>
        </div>
        {isEc2 && accountId && (
          <div className="pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowMetrics(true)}
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
    </Card>
  );
}

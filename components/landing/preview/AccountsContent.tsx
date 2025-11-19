'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ArrowUpDown, Filter, RefreshCw, Server } from 'lucide-react';

// Mock 리소스 데이터
const mockResources = [
  {
    id: 'i-1234567890abcdef0',
    name: 'production-web-server-1',
    provider: 'AWS',
    service: 'EC2',
    status: 'running',
    region: 'ap-northeast-2',
    instanceType: 't3.medium',
    publicIp: '52.78.123.456',
    privateIp: '10.0.1.45',
    cost: 42000,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i-0987654321fedcba0',
    name: 'production-db-server',
    provider: 'AWS',
    service: 'EC2',
    status: 'running',
    region: 'ap-northeast-2',
    instanceType: 't3.large',
    publicIp: '13.124.234.567',
    privateIp: '10.0.2.32',
    cost: 67000,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vm-staging-app',
    name: 'staging-app-server',
    provider: 'GCP',
    service: 'Instance',
    status: 'running',
    region: 'asia-northeast3-a',
    instanceType: 'n1-standard-2',
    publicIp: '34.64.123.45',
    privateIp: '10.128.0.12',
    cost: 38000,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vm-dev-test-1',
    name: 'development-test-vm',
    provider: 'Azure',
    service: 'Virtual Machine',
    status: 'running',
    region: 'Korea Central',
    instanceType: 'Standard_B2s',
    publicIp: '20.194.45.67',
    privateIp: '10.1.0.5',
    cost: 28000,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i-stopped-instance',
    name: 'backup-server',
    provider: 'AWS',
    service: 'EC2',
    status: 'stopped',
    region: 'ap-northeast-2',
    instanceType: 't3.small',
    publicIp: 'N/A',
    privateIp: '10.0.3.78',
    cost: 0,
    updatedAt: new Date().toISOString(),
  },
];

type SortKey = 'cost' | 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

const SORT_OPTIONS = [
  { value: 'cost' as const, label: '비용' },
  { value: 'name' as const, label: '이름' },
  { value: 'updatedAt' as const, label: '업데이트' },
];

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

export function AccountsContent() {
  const [providerFilter, setProviderFilter] = useState<string[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const providers = useMemo(() => {
    return Array.from(new Set(mockResources.map((item) => item.provider))).sort();
  }, []);

  const services = useMemo(() => {
    return Array.from(new Set(mockResources.map((item) => item.service))).sort();
  }, []);

  const filteredResources = useMemo(() => {
    const filtered = mockResources.filter((item) => {
      const providerMatch = providerFilter.length === 0 || providerFilter.includes(item.provider);
      const serviceMatch = serviceFilter.length === 0 || serviceFilter.includes(item.service);
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
  }, [providerFilter, serviceFilter, sortKey, sortOrder]);

  const toggleFilter = (value: string, list: string[], setter: (values: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 필터 및 정렬 */}
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
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 리소스 개수 */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>총 {filteredResources.length}개의 리소스</span>
        {(providerFilter.length + serviceFilter.length > 0) && (
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

      {/* 리소스 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-sky-100 text-sky-700">{resource.provider}</Badge>
                  <div className="flex items-center gap-1">
                    <Server className="h-3 w-3 text-slate-500" />
                    <span className="text-xs uppercase tracking-wide text-slate-500">{resource.service}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    resource.status === 'running'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }
                >
                  {resource.status}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold text-slate-900">{resource.name}</CardTitle>
              <div className="text-xs text-slate-500 font-mono">{resource.id}</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">인스턴스 타입</span>
                <span className="font-medium text-slate-900">{resource.instanceType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">퍼블릭 IP</span>
                <span className="font-mono text-xs text-slate-700">{resource.publicIp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">프라이빗 IP</span>
                <span className="font-mono text-xs text-slate-700">{resource.privateIp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">리전</span>
                <span className="font-medium text-slate-700">{resource.region}</span>
              </div>
              {resource.cost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">월간 비용</span>
                  <span className="text-base font-semibold text-slate-900">{formatCurrency(resource.cost)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">업데이트</span>
                <span className="font-medium text-slate-700">{formatDate(resource.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

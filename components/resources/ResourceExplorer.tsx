'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { FreeTierCard } from './FreeTierCard';
import { ArrowUpDown, Filter, RefreshCw } from 'lucide-react';

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
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources,
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
      <FreeTierCard />

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
              onClick={() => refetch()}
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

      {isLoading ? (
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
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: ResourceItem }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-100 text-sky-700">{resource.provider}</Badge>
            <span className="text-xs uppercase tracking-wide text-slate-500">{resource.service}</span>
          </div>
          <span className="text-sm font-medium text-slate-500">{resource.status}</span>
        </div>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {resource.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">월간 비용</span>
          <span className="text-base font-semibold text-slate-900">{formatCurrency(resource.cost)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">리전</span>
          <span className="font-medium text-slate-700">{resource.region}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">업데이트</span>
          <span className="font-medium text-slate-700">{formatDate(resource.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

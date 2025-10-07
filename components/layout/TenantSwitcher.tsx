'use client';

import { useContextStore } from '@/store/context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Tenant } from '@/types/core';

interface TenantSwitcherProps {
  tenants: Tenant[];
}

export function TenantSwitcher({ tenants }: TenantSwitcherProps) {
  const { tenantId, setTenantId } = useContextStore();
  const currentTenant = tenants.find(t => t.id === tenantId);

  return (
    <Select value={tenantId} onValueChange={setTenantId}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="테넌트 선택">
          {currentTenant?.name || '테넌트 선택'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            {tenant.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

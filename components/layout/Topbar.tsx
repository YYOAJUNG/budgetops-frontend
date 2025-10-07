'use client';

import { useContextStore } from '@/store/context';
import { useTenants } from '@/lib/api/queries';
import { TenantSwitcher } from './TenantSwitcher';
import { DateRangePicker } from './DateRangePicker';
import { CurrencySelect } from './CurrencySelect';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';

export function Topbar() {
  const { tenantId, currency } = useContextStore();
  const { data: tenants } = useTenants();

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <TenantSwitcher tenants={tenants || []} />
        <DateRangePicker />
        <CurrencySelect />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

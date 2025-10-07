'use client';

import { useContextStore } from '@/store/context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Currency } from '@/types/core';

export function CurrencySelect() {
  const { currency, setCurrency } = useContextStore();

  return (
    <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
      <SelectTrigger className="w-20">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="KRW">KRW</SelectItem>
        <SelectItem value="USD">USD</SelectItem>
      </SelectContent>
    </Select>
  );
}

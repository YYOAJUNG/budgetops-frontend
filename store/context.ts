import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type { Currency } from '@/types/core';

interface ContextState {
  tenantId: string;
  from: string;
  to: string;
  currency: Currency;
  setTenantId: (id: string) => void;
  setDateRange: (from: string, to: string) => void;
  setCurrency: (currency: Currency) => void;
}

export const useContextStore = create<ContextState>()(
  persist(
    (set) => ({
      tenantId: 't1',
      from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD'),
      currency: 'KRW',
      setTenantId: (id) => set({ tenantId: id }),
      setDateRange: (from, to) => set({ from, to }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'budgetops-context',
    }
  )
);


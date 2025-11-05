'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { CostsSummary } from '@/components/costs/CostsSummary';

export default function CostsPage() {
  return (
    <MainLayout>
      <CostsSummary />
    </MainLayout>
  );
}



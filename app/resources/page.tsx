'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { ResourceExplorer } from '@/components/resources/ResourceExplorer';

export default function ResourcesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">리소스 관리</h2>
          <p className="mt-2 text-sm text-slate-600">
            클라우드 사업자와 서비스 기준으로 필터하고, 원하는 기준으로 정렬하여 리소스를 탐색하세요.
          </p>
        </div>
        <ResourceExplorer />
      </div>
    </MainLayout>
  );
}

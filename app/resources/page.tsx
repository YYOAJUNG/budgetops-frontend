'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { ResourceExplorer } from '@/components/resources/ResourceExplorer';

export default function ResourcesPage() {
  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">리소스 관리</h2>
          <p className="text-gray-600 mt-2">
            클라우드 사업자와 서비스 기준으로 필터하고, 원하는 기준으로 정렬하여 리소스를 탐색하세요.
          </p>
        </div>
        <ResourceExplorer />
      </div>
    </MainLayout>
  );
}

'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { CostsSummary } from '@/components/costs/CostsSummary';
import { RecommendationCards } from '@/components/costs/RecommendationCards';
import { useQuery } from '@tanstack/react-query';
import { getAllEc2Instances } from '@/lib/api/aws';
import { getAllGcpResources } from '@/lib/api/gcp';

export default function CostsPage() {
  // EC2 인스턴스 조회 (리소스 ID 수집용)
  const { data: ec2Instances } = useQuery({
    queryKey: ['ec2-instances'],
    queryFn: getAllEc2Instances,
  });

  // GCP 리소스 조회 (리소스 ID 수집용)
  const { data: gcpAccountResources } = useQuery({
    queryKey: ['gcp-resources'],
    queryFn: getAllGcpResources,
  });

  // AWS EC2 + GCP 리소스 ID 통합
  const awsResourceIds = ec2Instances?.map(instance => instance.instanceId) || [];
  const gcpResourceIds = gcpAccountResources?.flatMap(accountResources =>
    accountResources.resources.map(resource => resource.resourceId)
  ) || [];
  const resourceIds = [...awsResourceIds, ...gcpResourceIds];

  

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">비용 관리</h1>
          <p className="text-gray-600 text-base">클라우드 비용을 분석하고 최적화하세요</p>
        </div>

        {/* 추천 액션 카드 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">추천 액션</h2>
              <p className="text-sm text-gray-500 mt-1">실제 리소스 기반 최적화 제안</p>
            </div>
          </div>
          <RecommendationCards resourceIds={resourceIds} />
        </div>

        {/* 비용 요약 */}
        <div className="space-y-4">
          <CostsSummary />
        </div>
      </div>
    </MainLayout>
  );
}



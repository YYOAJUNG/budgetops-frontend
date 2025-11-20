'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Cloud, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddCloudAccountDialog } from './AddCloudAccountDialog';
import { getCurrentUser } from '@/lib/api/user';
import { CloudAccount } from '@/types/mypage';
import { PROVIDER_COLORS, ACCOUNT_STATUS_CONFIG } from '@/constants/mypage';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAwsAccounts, deleteAwsAccount, type AwsAccount } from '@/lib/api/aws';
import { getAzureAccounts, deleteAzureAccount, type AzureAccount } from '@/lib/api/azure';
import { getGcpAccounts, deleteGcpAccount, type GcpAccount } from '@/lib/api/gcp';
import { getNcpAccounts, deleteNcpAccount, type NcpAccount } from '@/lib/api/ncp';

export function CloudAccountConnection() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  const { data: awsAccounts, refetch: refetchAws, isLoading: isLoadingAws } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
    staleTime: 0, // 항상 최신 데이터 가져오기
    gcTime: 0, // 캐시 시간 최소화 (React Query v5)
  });
  const { data: azureAccounts, refetch: refetchAzure, isLoading: isLoadingAzure } = useQuery({
    queryKey: ['azureAccounts'],
    queryFn: getAzureAccounts,
    staleTime: 0,
    gcTime: 0,
  });
  const { data: gcpAccounts, refetch: refetchGcp, isLoading: isLoadingGcp } = useQuery({
    queryKey: ['gcpAccounts'],
    queryFn: getGcpAccounts,
    staleTime: 0, // 항상 최신 데이터 가져오기
    gcTime: 0, // 캐시 시간 최소화 (React Query v5)
  });
  const { data: ncpAccounts, refetch: refetchNcp, isLoading: isLoadingNcp } = useQuery({
    queryKey: ['ncpAccounts'],
    queryFn: getNcpAccounts,
    staleTime: 0,
    gcTime: 0,
  });
  const mergedAccounts = useMemo<CloudAccount[]>(() => {
    const awsMapped: CloudAccount[] =
      (awsAccounts || []).map((a: AwsAccount) => ({
        id: String(a.id),
        provider: 'AWS',
        accountName: a.name,
        accountId: a.accessKeyId,
        status: a.active ? 'connected' : 'pending',
        lastSync: new Date().toISOString(),
        monthlyCost: 0,
      }));
    const gcpMapped: CloudAccount[] =
      (gcpAccounts || []).map((g: GcpAccount) => ({
        id: String(g.id),
        provider: 'GCP',
        accountName: g.name || g.serviceAccountName, // 사용자가 입력한 계정 이름, 없으면 serviceAccountName 사용
        accountId: `${g.serviceAccountName}@${g.projectId}`, // serviceaccountname@projectid 형식
        status: 'connected' as const,
        lastSync: g.createdAt || new Date().toISOString(),
        monthlyCost: 0,
      }));
    const azureMapped: CloudAccount[] =
      (azureAccounts || []).map((a: AzureAccount) => ({
        id: `azure-${a.id}`,
        provider: 'Azure' as const,
        accountName: a.name,
        accountId: a.subscriptionId,
        status: a.active ? 'connected' : 'pending',
        lastSync: new Date().toISOString(),
        monthlyCost: 0,
      }));
    const ncpMapped: CloudAccount[] =
      (ncpAccounts || []).map((n: NcpAccount) => ({
        id: `ncp-${n.id}`,
        provider: 'NCP' as const,
        accountName: n.name,
        accountId: n.accessKey,
        status: n.active ? 'connected' : 'pending',
        lastSync: new Date().toISOString(),
        monthlyCost: 0,
      }));
    // AWS, GCP, Azure, NCP 계정을 합쳐서 반환
    return [...awsMapped, ...gcpMapped, ...azureMapped, ...ncpMapped];
  }, [awsAccounts, gcpAccounts, azureAccounts, ncpAccounts]);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const shouldOpen = searchParams.get('addCloudAccount') === '1';
    if (shouldOpen) {
      // 섹션으로 스크롤 이동
      const section = document.getElementById('accounts');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // 다이얼로그 열기
      setShowAddDialog(true);
      // URL 정리 (뒤로 가기 시 재오픈 방지)
      const url = new URL(window.location.href);
      url.searchParams.delete('addCloudAccount');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const handleDeleteAccount = async (id: string) => {
    // 삭제 확인
    const account = mergedAccounts.find(acc => acc.id === id);
    const accountName = account?.accountName || '이 계정';
    
    if (!confirm(`${accountName}을(를) 정말 삭제하시겠습니까?\n\n삭제된 계정은 복구할 수 없습니다.`)) {
      return;
    }

    setDeletingAccountId(id);
    try {
      // AWS 계정인 경우 API 호출
      const awsAccount = awsAccounts?.find((a: AwsAccount) => String(a.id) === id);
      if (awsAccount) {
        await deleteAwsAccount(awsAccount.id);
        // 캐시 완전히 제거 및 목록 재조회
        queryClient.removeQueries({ queryKey: ['awsAccounts'] });
        await refetchAws();
        // 추가로 한 번 더 무효화하여 최신 데이터 확보
        queryClient.invalidateQueries({ queryKey: ['awsAccounts'] });
        await refetchAws();
      } else {
        // GCP 계정인 경우 API 호출
        const gcpAccount = gcpAccounts?.find((g: GcpAccount) => String(g.id) === id);
        if (gcpAccount) {
          console.log('Deleting GCP account:', gcpAccount.id, gcpAccount);
          await deleteGcpAccount(gcpAccount.id);
          // 캐시 완전히 제거 및 목록 재조회
          queryClient.removeQueries({ queryKey: ['gcpAccounts'] });
          queryClient.removeQueries({ queryKey: ['gcp-resources'] });
          await refetchGcp();
          // 추가로 한 번 더 무효화하여 최신 데이터 확보
          queryClient.invalidateQueries({ queryKey: ['gcpAccounts'] });
          queryClient.invalidateQueries({ queryKey: ['gcp-resources'] });
          await refetchGcp();
        } else {
          // Azure 계정인 경우 API 호출
          const azureAccount = azureAccounts?.find((a: AzureAccount) => `azure-${a.id}` === id);
          if (azureAccount) {
            await deleteAzureAccount(azureAccount.id);
            // 캐시 완전히 제거 및 목록 재조회
            queryClient.removeQueries({ queryKey: ['azureAccounts'] });
            await refetchAzure();
            // 추가로 한 번 더 무효화하여 최신 데이터 확보
            queryClient.invalidateQueries({ queryKey: ['azureAccounts'] });
            await refetchAzure();
          } else {
            // NCP 계정인 경우 API 호출
            const ncpAccount = ncpAccounts?.find((n: NcpAccount) => `ncp-${n.id}` === id);
            if (ncpAccount) {
              await deleteNcpAccount(ncpAccount.id);
              // 캐시 완전히 제거 및 목록 재조회
              queryClient.removeQueries({ queryKey: ['ncpAccounts'] });
              await refetchNcp();
              // 추가로 한 번 더 무효화하여 최신 데이터 확보
              queryClient.invalidateQueries({ queryKey: ['ncpAccounts'] });
              await refetchNcp();
            }
          }
        }
      }
    } catch (error: any) {
      console.error('계정 삭제 오류:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '계정 삭제 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setDeletingAccountId(null);
    }
  };

  const handleAddAccount = () => {
    setShowAddDialog(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">클라우드 계정 연동</h2>
          <p className="text-gray-600 mt-1">AWS, GCP, Azure, NCP 계정을 연결하여 비용을 관리하세요</p>
        </div>
        <Button
          onClick={handleAddAccount}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          계정 추가
        </Button>
      </div>

      {/* 연결된 계정 목록 */}
      <div className="space-y-4 mb-8">
        {mergedAccounts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              연결된 계정이 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              클라우드 계정을 연결하여 비용 분석을 시작하세요
            </p>
            <Button
              onClick={handleAddAccount}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              첫 계정 추가하기
            </Button>
          </div>
        ) : (
          mergedAccounts.map((account) => {
            const StatusIcon = ACCOUNT_STATUS_CONFIG[account.status].icon;
            return (
              <div
                key={account.id}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        variant="outline"
                        className={`${PROVIDER_COLORS[account.provider]} font-semibold`}
                      >
                        {account.provider}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={ACCOUNT_STATUS_CONFIG[account.status].color}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {ACCOUNT_STATUS_CONFIG[account.status].label}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {account.accountName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      계정 ID: {account.accountId}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">마지막 동기화</p>
                        <p className="font-medium text-gray-900">{account.lastSync}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">이번 달 비용</p>
                        <p className="font-medium text-gray-900">
                          ${account.monthlyCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700"
                    >
                      동기화
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={deletingAccountId === account.id}
                      className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingAccountId === account.id && <span className="ml-1">삭제 중...</span>}
                    </Button>
                  </div>
                </div>

                {account.status === 'error' && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      연결에 문제가 발생했습니다. 계정 자격 증명을 확인하세요.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AddCloudAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={async () => {
          // 계정 추가 성공 시 캐시 완전히 제거 및 재조회
          queryClient.removeQueries({ queryKey: ['awsAccounts'] });
          queryClient.removeQueries({ queryKey: ['gcpAccounts'] });
          queryClient.removeQueries({ queryKey: ['azureAccounts'] });
          queryClient.removeQueries({ queryKey: ['ncpAccounts'] });
          await refetchAws();
          await refetchGcp();
          await refetchAzure();
          await refetchNcp();
          // 추가로 한 번 더 무효화하여 최신 데이터 확보
          queryClient.invalidateQueries({ queryKey: ['awsAccounts'] });
          queryClient.invalidateQueries({ queryKey: ['gcpAccounts'] });
          queryClient.invalidateQueries({ queryKey: ['azureAccounts'] });
          queryClient.invalidateQueries({ queryKey: ['ncpAccounts'] });
          await refetchAws();
          await refetchGcp();
          await refetchAzure();
          await refetchNcp();
          // 리소스 및 비용 관련 캐시도 무효화
          queryClient.invalidateQueries({ queryKey: ['resources'] });
          queryClient.invalidateQueries({ queryKey: ['ec2-instances'] });
          queryClient.invalidateQueries({ queryKey: ['awsAccountCosts'] });
          queryClient.invalidateQueries({ queryKey: ['azureAccountCosts'] });
        }}
        userName={user?.name || '사용자'}
      />
    </div>
  );
}

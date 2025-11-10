'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cloud, Plus, Trash2, Server, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddCloudAccountDialog } from './AddCloudAccountDialog';
import { getCurrentUser } from '@/lib/api/user';
import { CloudAccount } from '@/types/mypage';
import { PROVIDER_COLORS, ACCOUNT_STATUS_CONFIG } from '@/constants/mypage';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAwsAccounts, getEc2Instances, type AwsAccount, type AwsEc2Instance } from '@/lib/api/aws';

const mockAccounts: CloudAccount[] = [
  {
    id: '1',
    provider: 'AWS',
    accountName: 'Production AWS',
    accountId: '229342747685',
    status: 'connected',
    lastSync: '2025-10-30 14:30',
    monthlyCost: 34,
  },
  {
    id: '2',
    provider: 'GCP',
    accountName: 'Staging GCP',
    accountId: 'Moon-SEO',
    status: 'connected',
    lastSync: '2025-10-30 14:25',
    monthlyCost: 13,
  },
];

export function CloudAccountConnection() {
  const [accounts, setAccounts] = useState<CloudAccount[]>(mockAccounts);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [ec2InstancesMap, setEc2InstancesMap] = useState<Record<string, AwsEc2Instance[]>>({});
  const [loadingEc2Map, setLoadingEc2Map] = useState<Record<string, boolean>>({});
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  const { data: awsAccounts, refetch: refetchAws } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
  });
  const mergedAccounts = useMemo<CloudAccount[]>(() => {
    const mapped: CloudAccount[] =
      (awsAccounts || []).map((a: AwsAccount) => ({
        id: String(a.id),
        provider: 'AWS',
        accountName: a.name,
        accountId: a.accessKeyId,
        status: a.active ? 'connected' : 'pending',
        lastSync: new Date().toISOString(),
        monthlyCost: 0,
      }));
    // API 결과가 있으면 API 기준으로 보여주기
    return mapped.length > 0 ? mapped : accounts;
  }, [awsAccounts, accounts]);
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

  const handleDeleteAccount = (id: string) => {
    // TODO: API 호출로 계정 삭제
    setAccounts(accounts.filter(acc => acc.id !== id));
  };

  const handleAddAccount = () => {
    setShowAddDialog(true);
  };

  const toggleAccountExpansion = async (accountId: string, awsAccountId?: number, region?: string) => {
    const isExpanded = expandedAccounts.has(accountId);
    
    if (isExpanded) {
      // 접기
      setExpandedAccounts(prev => {
        const next = new Set(prev);
        next.delete(accountId);
        return next;
      });
    } else {
      // 펼치기 - EC2 리소스 조회
      setExpandedAccounts(prev => new Set(prev).add(accountId));
      
      // 이미 로드된 데이터가 있으면 스킵
      if (ec2InstancesMap[accountId]) {
        return;
      }
      
      // AWS 계정인 경우 EC2 인스턴스 조회
      if (awsAccountId) {
        setLoadingEc2Map(prev => ({ ...prev, [accountId]: true }));
        try {
          const instances = await getEc2Instances(awsAccountId, region);
          setEc2InstancesMap(prev => ({ ...prev, [accountId]: instances }));
        } catch (error) {
          console.error('Failed to fetch EC2 instances:', error);
          setEc2InstancesMap(prev => ({ ...prev, [accountId]: [] }));
        } finally {
          setLoadingEc2Map(prev => ({ ...prev, [accountId]: false }));
        }
      }
    }
  };

  const handleSyncAccount = async (accountId: string, awsAccountId?: number, region?: string) => {
    if (!awsAccountId) return;
    
    setLoadingEc2Map(prev => ({ ...prev, [accountId]: true }));
    try {
      const instances = await getEc2Instances(awsAccountId, region);
      setEc2InstancesMap(prev => ({ ...prev, [accountId]: instances }));
      // 성공 메시지 표시 (선택사항)
    } catch (error) {
      console.error('Failed to sync EC2 instances:', error);
      alert('EC2 리소스 동기화에 실패했습니다.');
    } finally {
      setLoadingEc2Map(prev => ({ ...prev, [accountId]: false }));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">클라우드 계정 연동</h2>
          <p className="text-gray-600 mt-1">AWS, GCP, Azure 계정을 연결하여 비용을 관리하세요</p>
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
            const isExpanded = expandedAccounts.has(account.id);
            const awsAccount = awsAccounts?.find((a: AwsAccount) => String(a.id) === account.id);
            const ec2Instances = ec2InstancesMap[account.id] || [];
            const isLoadingEc2 = loadingEc2Map[account.id] || false;
            
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

                    {/* EC2 리소스 정보 (AWS 계정인 경우) */}
                    {account.provider === 'AWS' && awsAccount && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAccountExpansion(account.id, awsAccount.id, awsAccount.defaultRegion)}
                          className="border-gray-300 text-gray-700"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              EC2 리소스 숨기기
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              EC2 리소스 보기
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* EC2 인스턴스 목록 */}
                    {isExpanded && account.provider === 'AWS' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {isLoadingEc2 ? (
                          <p className="text-sm text-gray-600">EC2 리소스를 불러오는 중...</p>
                        ) : ec2Instances.length === 0 ? (
                          <p className="text-sm text-gray-600">EC2 인스턴스가 없습니다.</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                              EC2 인스턴스 ({ec2Instances.length}개)
                            </p>
                            {ec2Instances.map((instance) => (
                              <div
                                key={instance.instanceId}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Server className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium text-gray-900">
                                        {instance.name || instance.instanceId}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={
                                          instance.state === 'running'
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : instance.state === 'stopped'
                                            ? 'border-red-200 bg-red-50 text-red-700'
                                            : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                        }
                                      >
                                        {instance.state}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 font-mono mb-1">
                                      {instance.instanceId}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                      <div>
                                        <span className="font-medium">타입:</span> {instance.instanceType}
                                      </div>
                                      <div>
                                        <span className="font-medium">리전:</span> {instance.availabilityZone}
                                      </div>
                                      {instance.publicIp && (
                                        <div>
                                          <span className="font-medium">Public IP:</span> {instance.publicIp}
                                        </div>
                                      )}
                                      {instance.privateIp && (
                                        <div>
                                          <span className="font-medium">Private IP:</span> {instance.privateIp}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {account.provider === 'AWS' && awsAccount && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncAccount(account.id, awsAccount.id, awsAccount.defaultRegion)}
                        disabled={isLoadingEc2}
                        className="border-gray-300 text-gray-700"
                      >
                        {isLoadingEc2 ? '동기화 중...' : '동기화'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
        onSuccess={() => {
          // 계정 추가 성공 시 목록 재조회
          refetchAws();
        }}
        userName={user?.name || '사용자'}
      />
    </div>
  );
}

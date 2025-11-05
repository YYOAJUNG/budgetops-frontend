'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cloud, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddCloudAccountDialog } from './AddCloudAccountDialog';
import { getCurrentUser } from '@/lib/api/user';
import { PROVIDER_COLORS, ACCOUNT_STATUS_CONFIG } from '@/constants/mypage';
import { getAwsAccounts, deleteAwsAccount, AwsAccountSummary } from '@/lib/api/aws';

export function CloudAccountConnection() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
  });

  const { mutateAsync: removeAccount, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteAwsAccount(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['awsAccounts'] });
    }
  });

  const accounts: AwsAccountSummary[] = data || [];

  const handleDeleteAccount = async (id: number) => {
    await removeAccount(id);
  };

  const handleAddAccount = () => {
    setShowAddDialog(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">클라우드 계정 연동</h2>
          <p className="text-gray-600 mt-1">AWS 계정을 연결하여 비용을 관리하세요</p>
        </div>
        <Button onClick={handleAddAccount} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          계정 추가
        </Button>
      </div>

      {/* 목록 영역 */}
      <div className="space-y-4 mb-8">
        {isLoading ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">계정 목록을 불러오지 못했습니다.</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">연결된 계정이 없습니다</h3>
            <p className="text-gray-600 mb-4">클라우드 계정을 연결하여 비용 분석을 시작하세요</p>
            <Button onClick={handleAddAccount} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              첫 계정 추가하기
            </Button>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className={`${PROVIDER_COLORS['AWS']} font-semibold`}>
                      AWS
                    </Badge>
                    <Badge variant="outline" className={ACCOUNT_STATUS_CONFIG['connected'].color}>
                      <ACCOUNT_STATUS_CONFIG['connected'].icon className="h-3 w-3 mr-1" />
                      {ACCOUNT_STATUS_CONFIG['connected'].label}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{account.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">AccessKey: {account.accessKeyId} · Region: {account.defaultRegion}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                    동기화
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                    disabled={isDeleting}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddCloudAccountDialog open={showAddDialog} onOpenChange={setShowAddDialog} userName={user?.name || '사용자'} />
    </div>
  );
}

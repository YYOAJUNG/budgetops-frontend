'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cloud, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddCloudAccountDialog } from './AddCloudAccountDialog';
import { getCurrentUser } from '@/lib/api/user';
import { CloudAccount } from '@/types/mypage';
import { PROVIDER_COLORS, ACCOUNT_STATUS_CONFIG } from '@/constants/mypage';

const mockAccounts: CloudAccount[] = [
  {
    id: '1',
    provider: 'AWS',
    accountName: 'Production AWS',
    accountId: '123456789012',
    status: 'connected',
    lastSync: '2024-10-30 14:30',
    monthlyCost: 2134,
  },
  {
    id: '2',
    provider: 'GCP',
    accountName: 'Staging GCP',
    accountId: 'my-project-123',
    status: 'connected',
    lastSync: '2024-10-30 14:25',
    monthlyCost: 456,
  },
];

export function CloudAccountConnection() {
  const [accounts, setAccounts] = useState<CloudAccount[]>(mockAccounts);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const handleDeleteAccount = (id: string) => {
    // TODO: API 호출로 계정 삭제
    setAccounts(accounts.filter(acc => acc.id !== id));
  };

  const handleAddAccount = () => {
    setShowAddDialog(true);
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
        {accounts.length === 0 ? (
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
          accounts.map((account) => {
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
        userName={user?.name || '사용자'}
      />
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Cloud, Shield, Database, Server, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { mockAccounts } from '@/lib/api/mock-data';
import { formatCurrency } from '@/lib/utils';
import type { CloudProvider } from '@/types/accounts';

const providerIcons = {
  AWS: Shield,
  GCP: Cloud,
  AZURE: Database,
  NCP: Server,
};

// StatusBadge 컴포넌트를 사용하므로 statusConfig 제거

interface AccountListProps {
  accounts?: any[];
}

export function AccountList({ accounts: propAccounts }: AccountListProps) {
  const accounts = propAccounts || mockAccounts;

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>연결된 계정</CardTitle>
          <CardDescription>연결된 클라우드 계정이 없습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Cloud className="h-8 w-8" />}
            title="계정이 없습니다"
            description="왼쪽 폼을 사용하여 클라우드 계정을 연결하세요."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">연결된 계정</CardTitle>
        <CardDescription className="text-gray-600">{accounts.length}개의 계정이 연결되어 있습니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => {
          const Icon = providerIcons[account.provider as CloudProvider];
          
          return (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{account.name}</h4>
                    <StatusBadge status={account.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {account.provider} • {account.connectedAt && new Date(account.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {account.status === 'ERROR' && (
                  <Button variant="ghost" size="sm" title="오류 확인" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" title="동기화" className="text-gray-600 hover:text-gray-700 hover:bg-gray-100">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="삭제" className="text-gray-600 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { getAdminUsers, grantTokensToUser, type AdminUser, type GrantTokensRequest } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, ChevronLeft, ChevronRight, Search, X, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDateKST, formatDateTimeKST } from '@/lib/utils';

function GrantTokensDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSuccess: () => void;
}) {
  const [tokens, setTokens] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const tokenAmount = parseInt(tokens, 10);
    if (isNaN(tokenAmount) || tokenAmount < 1) {
      setError('토큰 수량은 1 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: GrantTokensRequest = {
        tokens: tokenAmount,
        reason: reason || undefined,
      };
      await grantTokensToUser(user.id, request);
      onSuccess();
      setTokens('');
      setReason('');
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '토큰 부여에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle>토큰 부여</DialogTitle>
          <DialogDescription>
            {user?.name}({user?.email})에게 토큰을 부여합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label htmlFor="tokens" className="block text-sm font-medium text-gray-700 mb-1">
              토큰 수량 <span className="text-red-500">*</span>
            </label>
            <Input
              id="tokens"
              type="number"
              min="1"
              value={tokens}
              onChange={(e) => setTokens(e.target.value)}
              placeholder="예: 1000"
              required
            />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              사유 (선택사항)
            </label>
            <Input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 이벤트 보상"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTokens('');
                setReason('');
                setError(null);
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  부여 중...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  부여
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UsersTable() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const queryClient = useQueryClient();
  const pageSize = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers', page, search],
    queryFn: () => getAdminUsers(page, pageSize, search || undefined),
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0); // 검색 시 첫 페이지로 리셋
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleGrantSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
  };


  const formatCloudAccounts = (user: AdminUser) => {
    const accounts: string[] = [];
    if (user.awsAccountCount > 0) accounts.push(`AWS: ${user.awsAccountCount}`);
    if (user.azureAccountCount > 0) accounts.push(`Azure: ${user.azureAccountCount}`);
    if (user.gcpAccountCount > 0) accounts.push(`GCP: ${user.gcpAccountCount}`);
    if (user.ncpAccountCount > 0) accounts.push(`NCP: ${user.ncpAccountCount}`);
    return accounts.length > 0 ? accounts.join(', ') : '-';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">사용자 목록을 불러오는 중 오류가 발생했습니다.</p>
        {error instanceof Error && <p className="text-sm text-gray-500 mt-2">{error.message}</p>}
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">사용자가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      {/* 검색 영역 */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="사용자 이름 또는 이메일로 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} variant="outline">
          검색
        </Button>
        {search && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>검색어: "{search}"</span>
            <button
              onClick={handleClearSearch}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              초기화
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">이름</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">가입일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">멤버십</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">토큰</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">클라우드 계정</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">최근 접속일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.content.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDateKST(user.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.billingPlan === 'PRO'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.billingPlan}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {user.currentTokens.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatCloudAccounts(user)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDateTimeKST(user.lastLoginAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowGrantDialog(true);
                      }}
                    >
                      토큰 부여
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        router.push(`/admin/payments?search=${encodeURIComponent(user.email)}`);
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      결제 내역 조회
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-600">
            전체 {data.totalElements}명 중 {page * pageSize + 1}-{Math.min((page + 1) * pageSize, data.totalElements)}명 표시
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              {page + 1} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={page >= data.totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <GrantTokensDialog
        open={showGrantDialog}
        onOpenChange={setShowGrantDialog}
        user={selectedUser}
        onSuccess={handleGrantSuccess}
      />
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600 mt-1">사용자 목록을 확인하고 토큰을 부여할 수 있습니다.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


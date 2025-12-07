'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { getAdminPayments, type PaymentHistory } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Filter, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type PaymentTypeFilter = 'ALL' | 'MEMBERSHIP' | 'TOKEN_PURCHASE';
type PaymentStatusFilter = 'ALL' | 'PAID' | 'PENDING' | 'FAILED' | 'IDLE';

function PaymentsTableContent() {
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<PaymentTypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // URL 쿼리 파라미터에서 검색어 읽어오기
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchInput(searchParam);
      setSearch(searchParam);
    }
  }, [searchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminPayments', search],
    queryFn: () => getAdminPayments(search || undefined),
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((payment) => {
      if (typeFilter !== 'ALL' && payment.paymentType !== typeFilter) return false;
      if (statusFilter !== 'ALL' && payment.status !== statusFilter) return false;
      return true;
    });
  }, [data, typeFilter, statusFilter]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: PaymentHistory['status']) => {
    const statusConfig = {
      PAID: { label: '완료', className: 'bg-green-100 text-green-800' },
      PENDING: { label: '대기', className: 'bg-yellow-100 text-yellow-800' },
      FAILED: { label: '실패', className: 'bg-red-100 text-red-800' },
      IDLE: { label: '대기중', className: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentTypeLabel = (type: PaymentHistory['paymentType']) => {
    return type === 'MEMBERSHIP' ? '멤버십' : '토큰 구매';
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
        <p className="text-red-600">결제 내역을 불러오는 중 오류가 발생했습니다.</p>
        {error instanceof Error && <p className="text-sm text-gray-500 mt-2">{error.message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200">
        {/* 검색 영역 */}
        <div className="flex items-center gap-2 flex-1">
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

        {/* 필터 - 우측 배치 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">필터:</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="type-filter" className="text-sm text-gray-600">결제 타입</label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PaymentTypeFilter)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">전체</option>
              <option value="MEMBERSHIP">멤버십</option>
              <option value="TOKEN_PURCHASE">토큰 구매</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-gray-600">상태</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatusFilter)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">전체</option>
              <option value="PAID">완료</option>
              <option value="PENDING">대기</option>
              <option value="FAILED">실패</option>
              <option value="IDLE">대기중</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            총 {filteredData.length}건
          </div>
        </div>
      </div>

      {/* 테이블 */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">결제 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">사용자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">타입</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">금액</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">결제일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">검증일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">결제 UID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{payment.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{payment.userName}</div>
                      <div className="text-gray-500">{payment.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {getPaymentTypeLabel(payment.paymentType)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {payment.amount !== null ? `${payment.amount.toLocaleString()}원` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {payment.lastVerifiedAt ? formatDate(payment.lastVerifiedAt) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {payment.impUid || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaymentsTable() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <PaymentsTableContent />
    </Suspense>
  );
}

export default function AdminPaymentsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">결제 내역</h1>
          <p className="text-gray-600 mt-1">전체 사용자의 결제 내역을 확인할 수 있습니다.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>결제 내역 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentsTable />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { showApiError, showNetworkError } from '@/store/error';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // 네트워크 오류는 3번까지 재시도
              if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
                return failureCount < 3;
              }
              // 4xx 오류는 재시도하지 않음
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              // 기타 오류는 2번까지 재시도
              return failureCount < 2;
            },
            onError: (error: any) => {
              if (!navigator.onLine) {
                showNetworkError();
              } else if (error?.response?.status === 401) {
                showApiError('인증이 필요합니다. 다시 로그인해주세요.');
              } else if (error?.response?.status === 403) {
                showApiError('접근 권한이 없습니다.');
              } else if (error?.response?.status >= 500) {
                showApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
              } else {
                showApiError(
                  error?.response?.data?.message || 
                  error?.message || 
                  '요청 처리 중 오류가 발생했습니다.'
                );
              }
            },
          },
          mutations: {
            onError: (error: any) => {
              if (!navigator.onLine) {
                showNetworkError();
              } else if (error?.response?.status === 401) {
                showApiError('인증이 필요합니다. 다시 로그인해주세요.');
              } else if (error?.response?.status === 403) {
                showApiError('접근 권한이 없습니다.');
              } else if (error?.response?.status >= 500) {
                showApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
              } else {
                showApiError(
                  error?.response?.data?.message || 
                  error?.message || 
                  '요청 처리 중 오류가 발생했습니다.'
                );
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


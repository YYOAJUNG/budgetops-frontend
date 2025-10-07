'use client';

import { useState, useCallback } from 'react';
import type { AccountFormData, AccountConnection } from '@/types/accounts';

export type LinkingStatus = 'idle' | 'loading' | 'success' | 'error' | 'pending';

export interface LinkingState {
  status: LinkingStatus;
  error: string | null;
  pendingAccount: AccountConnection | null;
}

export interface UseAccountLinkingReturn {
  linkingState: LinkingState;
  linkAccount: (data: AccountFormData) => Promise<void>;
  resetLinkingState: () => void;
  setLinkingStatus: (status: LinkingStatus, error?: string) => void;
}

export function useAccountLinking(): UseAccountLinkingReturn {
  const [linkingState, setLinkingState] = useState<LinkingState>({
    status: 'idle',
    error: null,
    pendingAccount: null,
  });

  const linkAccount = useCallback(async (data: AccountFormData) => {
    setLinkingState({
      status: 'loading',
      error: null,
      pendingAccount: null,
    });

    try {
      // 시뮬레이션된 API 호출 (2초 대기)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 랜덤하게 성공/실패/보류 상태 결정 (테스트용)
      const random = Math.random();
      
      if (random < 0.6) {
        // 60% 성공
        const newAccount: AccountConnection = {
          id: `acc_${Date.now()}`,
          provider: data.provider,
          name: data.name,
          status: 'CONNECTED',
          connectedAt: new Date().toISOString(),
        };

        setLinkingState({
          status: 'success',
          error: null,
          pendingAccount: newAccount,
        });
      } else if (random < 0.8) {
        // 20% 실패
        setLinkingState({
          status: 'error',
          error: '인증 정보가 올바르지 않습니다. API 키와 시크릿을 확인해주세요.',
          pendingAccount: null,
        });
      } else {
        // 20% 보류
        const pendingAccount: AccountConnection = {
          id: `acc_${Date.now()}`,
          provider: data.provider,
          name: data.name,
          status: 'PENDING',
          connectedAt: new Date().toISOString(),
        };

        setLinkingState({
          status: 'pending',
          error: null,
          pendingAccount,
        });
      }
    } catch (error) {
      setLinkingState({
        status: 'error',
        error: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
        pendingAccount: null,
      });
    }
  }, []);

  const resetLinkingState = useCallback(() => {
    setLinkingState({
      status: 'idle',
      error: null,
      pendingAccount: null,
    });
  }, []);

  const setLinkingStatus = useCallback((status: LinkingStatus, error?: string) => {
    setLinkingState(prev => ({
      ...prev,
      status,
      error: error || null,
    }));
  }, []);

  return {
    linkingState,
    linkAccount,
    resetLinkingState,
    setLinkingStatus,
  };
}

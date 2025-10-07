'use client';

import { useState, useCallback } from 'react';
import type { AccountFormData, AccountConnection } from '@/types/accounts';
import { accountsLinkingService } from '@/services/accountsLinking';

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
      const result = await accountsLinkingService.linkAccount(data);
      
      if (result.success && result.account) {
        setLinkingState({
          status: result.status === 'PENDING' ? 'pending' : 'success',
          error: null,
          pendingAccount: result.account,
        });
      } else {
        setLinkingState({
          status: 'error',
          error: result.error || '알 수 없는 오류가 발생했습니다.',
          pendingAccount: null,
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

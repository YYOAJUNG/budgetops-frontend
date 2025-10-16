import type { AccountFormData, AccountConnection } from '@/types/accounts';

export type LinkingResult = {
  success: boolean;
  account?: AccountConnection;
  error?: string;
  status: 'CONNECTED' | 'PENDING' | 'ERROR';
};

export interface AccountsLinkingService {
  linkAccount: (data: AccountFormData) => Promise<LinkingResult>;
  validateCredentials: (data: AccountFormData) => Promise<boolean>;
  simulateConnection: (data: AccountFormData) => Promise<LinkingResult>;
}

class AccountsLinkingServiceImpl implements AccountsLinkingService {
  async linkAccount(data: AccountFormData): Promise<LinkingResult> {
    try {
      // 1. 자격 증명 유효성 검사
      const isValid = await this.validateCredentials(data);
      if (!isValid) {
        return {
          success: false,
          error: '인증 정보가 올바르지 않습니다. API 키와 시크릿을 확인해주세요.',
          status: 'ERROR',
        };
      }

      // 2. 연결 시뮬레이션
      const result = await this.simulateConnection(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
        status: 'ERROR',
      };
    }
  }

  async validateCredentials(data: AccountFormData): Promise<boolean> {
    // 실제로는 API 호출로 자격 증명 검증
    // 여기서는 간단한 검증 로직
    const requiredFields = this.getRequiredFields(data.provider);
    
    for (const field of requiredFields) {
      if (!data[field as keyof AccountFormData]?.trim()) {
        return false;
      }
    }

    // 간단한 형식 검증
    if (data.provider === 'AWS') {
      const accessKeyId = data.accessKeyId || '';
      const secretAccessKey = data.secretAccessKey || '';
      return accessKeyId.startsWith('AKIA') && secretAccessKey.length >= 20;
    }

    if (data.provider === 'GCP') {
      const projectId = data.projectId || '';
      return projectId.includes('-') && projectId.length > 5;
    }

    if (data.provider === 'AZURE') {
      const subscriptionId = data.subscriptionId || '';
      return subscriptionId.includes('-') && subscriptionId.length === 36;
    }

    if (data.provider === 'NCP') {
      const accessKey = data.accessKey || '';
      const secretKey = data.secretKey || '';
      return accessKey.length >= 10 && secretKey.length >= 20;
    }

    return true;
  }

  async simulateConnection(data: AccountFormData): Promise<LinkingResult> {
    // 시뮬레이션된 지연
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 랜덤 결과 생성 (테스트용)
    const random = Math.random();
    
    const baseAccount: Omit<AccountConnection, 'status'> = {
      id: `acc_${Date.now()}`,
      provider: data.provider,
      name: data.name,
      connectedAt: new Date().toISOString(),
    };

    if (random < 0.6) {
      // 60% 성공
      return {
        success: true,
        account: {
          ...baseAccount,
          status: 'CONNECTED',
        },
        status: 'CONNECTED',
      };
    } else if (random < 0.8) {
      // 20% 실패
      return {
        success: false,
        error: '인증 정보가 올바르지 않습니다. API 키와 시크릿을 확인해주세요.',
        status: 'ERROR',
      };
    } else {
      // 20% 보류
      return {
        success: true,
        account: {
          ...baseAccount,
          status: 'PENDING',
        },
        status: 'PENDING',
      };
    }
  }

  private getRequiredFields(provider: string): string[] {
    const fieldMap: Record<string, string[]> = {
      AWS: ['accessKeyId', 'secretAccessKey'],
      GCP: ['projectId'],
      AZURE: ['subscriptionId', 'clientId', 'clientSecret', 'tenantId'],
      NCP: ['accessKey', 'secretKey'],
    };
    return fieldMap[provider] || [];
  }
}

export const accountsLinkingService = new AccountsLinkingServiceImpl();

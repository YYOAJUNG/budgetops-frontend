/**
 * 구독 및 결제 API
 */
import { api } from './client';
import { TEMP_USER_ID } from '../constants/payment';

// ========== Helper Functions ==========

const getUserId = (): number => TEMP_USER_ID;

const transformBillingResponse = (data: any): Subscription => ({
  planId: data.planId,
  planName: data.planName,
  price: data.price,
  nextPaymentDate: data.nextPaymentDate,
  status: data.status,
  currentTokens: data.currentTokens,
  maxTokens: data.maxTokens,
  tokenResetDate: data.tokenResetDate,
});

const calculateBonusTokens = (packageId: string): number => {
  const bonusMap: Record<string, number> = { small: 0, medium: 50, large: 150 };
  return bonusMap[packageId] || 0;
};

const isMockMode = (): boolean => process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ========== Type Definitions ==========

export interface Subscription {
  planId: 'free' | 'pro' | 'enterprise';
  planName: string;
  price: number | null;
  nextPaymentDate?: string;
  status: 'active' | 'canceled' | 'past_due';
  // 토큰/할당량 정보 (Backend BillingResponse와 호환)
  currentTokens?: number;
  maxTokens?: number;
  tokenResetDate?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl: string;
}

export interface TokenPurchaseRequest {
  packageId: string;
  amount: number;
  price: number;
  impUid: string;
}

export interface TokenPurchaseResponse {
  transactionId: string;
  purchasedTokens: number;
  bonusTokens: number;
  totalTokens: number;
  currentTokens: number;
  purchaseDate: string;
}

// ========== Mock Data ==========

export const mockSubscription: Subscription = {
  planId: 'pro',
  planName: 'Pro 플랜',
  price: 4900,
  nextPaymentDate: '2024-11-01',
  status: 'active',
  // 토큰 정보 (Backend BillingResponse와 동일한 형식)
  currentTokens: 80,
  maxTokens: 1000,
  tokenResetDate: '2024-11-01',
};

export const mockPaymentMethod: PaymentMethod = {
  id: '1',
  type: 'card',
  last4: '1234',
  brand: 'Visa',
  expiryMonth: 12,
  expiryYear: 25,
};

export const mockPaymentHistory: PaymentHistory[] = [
  {
    id: 'INV-2024-10',
    date: '2024-10-01',
    amount: 4900,
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: 'INV-2024-09',
    date: '2024-09-01',
    amount: 4900,
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: 'INV-2024-08',
    date: '2024-08-01',
    amount: 4900,
    status: 'paid',
    invoiceUrl: '#',
  },
];

// ========== API Functions ==========

export async function getCurrentSubscription(): Promise<Subscription> {
  if (isMockMode()) return mockSubscription;

  const userId = getUserId();
  const response = await api.get(`/v1/users/${userId}/billing`);
  return transformBillingResponse(response.data);
}

export async function getPaymentMethod(): Promise<PaymentMethod & { isRegistered: boolean }> {
  if (isMockMode()) {
    // Mock 모드: localStorage만 확인
    if (typeof window !== 'undefined') {
      const savedCardInfo = localStorage.getItem('paymentMethod');
      if (savedCardInfo) {
        const cardInfo = JSON.parse(savedCardInfo);
        return { ...cardInfo, isRegistered: true };
      }
    }
    return {
      id: '',
      type: 'card',
      last4: '',
      brand: '',
      expiryMonth: undefined,
      expiryYear: undefined,
      isRegistered: false,
    };
  }

  // 실제 모드: 백엔드 API로 등록 여부 확인
  const userId = getUserId();
  try {
    const response = await api.get(`/v1/users/${userId}/payment/status`);
    const isRegistered = response.data;

    if (isRegistered && typeof window !== 'undefined') {
      // 등록되어 있으면 localStorage의 카드 정보 반환
      const savedCardInfo = localStorage.getItem('paymentMethod');
      if (savedCardInfo) {
        const cardInfo = JSON.parse(savedCardInfo);
        return { ...cardInfo, isRegistered: true };
      }
    }

    // 등록되어 있지 않으면 localStorage도 삭제
    if (!isRegistered && typeof window !== 'undefined') {
      localStorage.removeItem('paymentMethod');
    }

    return {
      id: '',
      type: 'card',
      last4: '',
      brand: '',
      expiryMonth: undefined,
      expiryYear: undefined,
      isRegistered: false,
    };
  } catch (error) {
    console.error('[getPaymentMethod] API 오류:', error);
    // API 오류 시 등록되지 않은 것으로 간주
    return {
      id: '',
      type: 'card',
      last4: '',
      brand: '',
      expiryMonth: undefined,
      expiryYear: undefined,
      isRegistered: false,
    };
  }
}

export async function savePaymentMethod(cardInfo: PaymentMethod): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('paymentMethod', JSON.stringify(cardInfo));
  }
}

export async function getPaymentHistory(): Promise<PaymentHistory[]> {
  if (isMockMode()) return mockPaymentHistory;

  const userId = getUserId();
  const response = await api.get(`/v1/users/${userId}/payment/history`);
  return response.data;
}

export async function updateSubscription(planId: string): Promise<Subscription> {
  console.log('[updateSubscription] 시작 - planId:', planId);
  console.log('[updateSubscription] Mock 모드:', isMockMode());

  if (isMockMode()) {
    console.log('[updateSubscription] Mock 데이터 반환');
    return { ...mockSubscription, planId: planId as Subscription['planId'] };
  }

  console.log('[updateSubscription] API 호출');
  const userId = getUserId();
  const planName = planId.toUpperCase();
  const response = await api.put(`/v1/users/${userId}/billing/plan/${planName}`);
  console.log('[updateSubscription] API 응답:', response.data);
  return transformBillingResponse(response.data);
}

export async function purchaseTokens(
  request: TokenPurchaseRequest
): Promise<TokenPurchaseResponse> {
  if (isMockMode()) {
    const bonusTokens = calculateBonusTokens(request.packageId);
    return {
      transactionId: `TXN-${Date.now()}`,
      purchasedTokens: request.amount,
      bonusTokens,
      totalTokens: request.amount + bonusTokens,
      currentTokens: 180,
      purchaseDate: new Date().toISOString(),
    };
  }

  const userId = getUserId();
  const response = await api.post(`/v1/users/${userId}/payment/purchase-tokens`, request);
  return response.data;
}

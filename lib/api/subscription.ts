// 구독 및 결제 API 및 Mock 데이터
import { api } from './client';

// ========== Helper Functions ==========

/**
 * 현재 사용자 ID 가져오기
 * TODO: 인증 시스템 구현 후 실제 사용자 정보 가져오기
 */
const getUserId = (): number => {
  return 1; // 임시 하드코딩
};

/**
 * Backend BillingResponse를 Frontend Subscription으로 변환
 */
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

/**
 * 패키지 ID로 보너스 토큰 계산
 */
const calculateBonusTokens = (packageId: string): number => {
  const bonusMap: Record<string, number> = {
    small: 0,
    medium: 50,
    large: 150,
  };
  return bonusMap[packageId] || 0;
};

/**
 * Mock 모드 여부 확인
 */
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

// 현재 구독 정보 가져오기
export async function getCurrentSubscription(): Promise<Subscription> {
  if (isMockMode()) return mockSubscription;

  try {
    const userId = getUserId();
    const response = await api.get(`/v1/users/${userId}/billing`);
    return transformBillingResponse(response.data);
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    throw error;
  }
}

// 결제 수단 가져오기
export async function getPaymentMethod(): Promise<PaymentMethod> {
  // TODO: 실제 API 호출
  // const response = await fetch('/api/payment/method');
  // return response.json();

  return mockPaymentMethod;
}

// 결제 내역 가져오기
export async function getPaymentHistory(): Promise<PaymentHistory[]> {
  if (isMockMode()) return mockPaymentHistory;

  try {
    const userId = getUserId();
    const response = await api.get(`/v1/users/${userId}/payment/history`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment history:', error);
    throw error;
  }
}

// 구독 플랜 변경
export async function updateSubscription(planId: string): Promise<Subscription> {
  if (isMockMode()) {
    return { ...mockSubscription, planId: planId as Subscription['planId'] };
  }

  try {
    const userId = getUserId();
    const planName = planId.toUpperCase();
    const response = await api.put(`/v1/users/${userId}/billing/plan/${planName}`);
    return transformBillingResponse(response.data);
  } catch (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }
}

// 구독 취소
export async function cancelSubscription(): Promise<void> {
  // TODO: 실제 API 호출
  // await fetch('/api/subscription', { method: 'DELETE' });
}

// 토큰 구매 (Pro 플랜 전용)
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

  try {
    const userId = getUserId();
    const response = await api.post(`/v1/users/${userId}/payment/purchase-tokens`, request);
    return response.data;
  } catch (error) {
    console.error('Failed to purchase tokens:', error);
    throw error;
  }
}

/**
 * 구독 및 결제 API
 */
import { api } from './client';

// ========== Helper Functions ==========

const userPathSegment = (userId: string | number): string =>
  encodeURIComponent(String(userId));

const paymentMethodStorageKey = (userId: string | number): string =>
  `paymentMethod:${String(userId)}`;

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

export async function getCurrentSubscription(userId: string | number): Promise<Subscription> {
  const response = await api.get(`/v1/users/${userPathSegment(userId)}/billing`);
  return transformBillingResponse(response.data);
}

export async function getPaymentMethod(
  userId: string | number
): Promise<PaymentMethod & { isRegistered: boolean }> {
  try {
    const response = await api.get(`/v1/users/${userPathSegment(userId)}/payment/status`);
    const isRegistered = response.data;

    if (isRegistered && typeof window !== 'undefined') {
      const savedCardInfo = localStorage.getItem(paymentMethodStorageKey(userId));
      if (savedCardInfo) {
        const cardInfo = JSON.parse(savedCardInfo);
        return { ...cardInfo, isRegistered: true };
      }
    }

    if (!isRegistered && typeof window !== 'undefined') {
      localStorage.removeItem(paymentMethodStorageKey(userId));
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

export async function savePaymentMethod(
  userId: string | number,
  cardInfo: PaymentMethod
): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(paymentMethodStorageKey(userId), JSON.stringify(cardInfo));
  }
}

export async function getPaymentHistory(userId: string | number): Promise<PaymentHistory[]> {
  try {
    const response = await api.get(`/v1/users/${userPathSegment(userId)}/payment/history`);
    return response.data;
  } catch (error) {
    console.error('[getPaymentHistory] API 오류:', error);
    return []; // 오류 시 빈 배열 반환
  }
}

export async function updateSubscription(
  userId: string | number,
  planId: string
): Promise<Subscription> {
  console.log('[updateSubscription] 시작 - planId:', planId);

  const planName = planId.toUpperCase();
  const response = await api.put(
    `/v1/users/${userPathSegment(userId)}/billing/plan/${planName}`
  );
  console.log('[updateSubscription] API 응답:', response.data);
  return transformBillingResponse(response.data);
}

export async function purchaseTokens(
  userId: string | number,
  request: TokenPurchaseRequest
): Promise<TokenPurchaseResponse> {
  const response = await api.post(
    `/v1/users/${userPathSegment(userId)}/payment/purchase-tokens`,
    request
  );
  return response.data;
}

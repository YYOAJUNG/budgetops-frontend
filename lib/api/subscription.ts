// 구독 및 결제 API 및 Mock 데이터

export interface Subscription {
  planId: 'free' | 'pro' | 'enterprise';
  planName: string;
  price: number | null;
  nextPaymentDate?: string;
  status: 'active' | 'canceled' | 'past_due';
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

// Mock 구독 데이터
export const mockSubscription: Subscription = {
  planId: 'pro',
  planName: '프로 플랜',
  price: 4900,
  nextPaymentDate: '2024-11-01',
  status: 'active',
};

// Mock 결제 수단
export const mockPaymentMethod: PaymentMethod = {
  id: '1',
  type: 'card',
  last4: '1234',
  brand: 'Visa',
  expiryMonth: 12,
  expiryYear: 25,
};

// Mock 결제 내역
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

// 현재 구독 정보 가져오기
export async function getCurrentSubscription(): Promise<Subscription> {
  // TODO: 실제 API 호출
  // const response = await fetch('/api/subscription/current');
  // return response.json();

  return mockSubscription;
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
  // TODO: 실제 API 호출
  // const response = await fetch('/api/payment/history');
  // return response.json();

  return mockPaymentHistory;
}

// 구독 플랜 변경
export async function updateSubscription(planId: string): Promise<Subscription> {
  // TODO: 실제 API 호출
  // const response = await fetch('/api/subscription', {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ planId }),
  // });
  // return response.json();

  return { ...mockSubscription, planId: planId as 'free' | 'pro' | 'enterprise' };
}

// 구독 취소
export async function cancelSubscription(): Promise<void> {
  // TODO: 실제 API 호출
  // await fetch('/api/subscription', { method: 'DELETE' });
}

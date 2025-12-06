// 관리자 API 함수들

import { api } from './client';

// 사용자 목록 조회 응답 타입
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  billingPlan: 'FREE' | 'PRO';
  currentTokens: number;
  cloudAccountCount: number;
  awsAccountCount: number;
  azureAccountCount: number;
  gcpAccountCount: number;
  ncpAccountCount: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 결제 내역 조회 응답 타입
export interface PaymentHistory {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  paymentType: 'MEMBERSHIP' | 'TOKEN_PURCHASE';
  impUid: string;
  amount: number | null;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'IDLE';
  createdAt: string;
  lastVerifiedAt: string;
}

// 토큰 부여 요청 타입
export interface GrantTokensRequest {
  tokens: number;
  reason?: string;
}

/**
 * 사용자 목록 조회
 */
export async function getAdminUsers(
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<AdminUser>> {
  const response = await api.get('/admin/users', {
    params: { page, size },
  });
  return response.data;
}

/**
 * 결제 내역 조회
 */
export async function getAdminPayments(): Promise<PaymentHistory[]> {
  const response = await api.get('/admin/payments');
  return response.data;
}

/**
 * 사용자에게 토큰 부여
 */
export async function grantTokensToUser(
  userId: number,
  request: GrantTokensRequest
): Promise<number> {
  const response = await api.post(`/admin/users/${userId}/tokens`, request);
  return response.data;
}


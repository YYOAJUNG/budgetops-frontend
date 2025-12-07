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
  impUid: string | null;
  amount: number | null;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'IDLE';
  paidAt: string | null;
  createdAt: string;
  lastVerifiedAt: string | null;
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
  size: number = 20,
  search?: string
): Promise<PaginatedResponse<AdminUser>> {
  // Mock 모드 처리
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const mockUsers: AdminUser[] = [
      {
        id: 1,
        email: 'user1@example.com',
        name: '홍길동',
        createdAt: '2024-01-15T10:00:00',
        billingPlan: 'PRO',
        currentTokens: 25000,
        cloudAccountCount: 3,
        awsAccountCount: 2,
        azureAccountCount: 1,
        gcpAccountCount: 0,
        ncpAccountCount: 0,
      },
      {
        id: 2,
        email: 'user2@example.com',
        name: '김철수',
        createdAt: '2024-02-01T14:30:00',
        billingPlan: 'FREE',
        currentTokens: 5000,
        cloudAccountCount: 1,
        awsAccountCount: 1,
        azureAccountCount: 0,
        gcpAccountCount: 0,
        ncpAccountCount: 0,
      },
      {
        id: 3,
        email: 'user3@example.com',
        name: '이영희',
        createdAt: '2024-02-15T09:20:00',
        billingPlan: 'PRO',
        currentTokens: 18000,
        cloudAccountCount: 4,
        awsAccountCount: 1,
        azureAccountCount: 1,
        gcpAccountCount: 1,
        ncpAccountCount: 1,
      },
      {
        id: 4,
        email: 'user4@example.com',
        name: '박민수',
        createdAt: '2024-03-01T16:45:00',
        billingPlan: 'FREE',
        currentTokens: 3000,
        cloudAccountCount: 2,
        awsAccountCount: 2,
        azureAccountCount: 0,
        gcpAccountCount: 0,
        ncpAccountCount: 0,
      },
      {
        id: 5,
        email: 'user5@example.com',
        name: '정수진',
        createdAt: '2024-03-10T11:15:00',
        billingPlan: 'PRO',
        currentTokens: 32000,
        cloudAccountCount: 5,
        awsAccountCount: 2,
        azureAccountCount: 1,
        gcpAccountCount: 1,
        ncpAccountCount: 1,
      },
      {
        id: 6,
        email: 'user6@example.com',
        name: '최도현',
        createdAt: '2024-03-20T13:30:00',
        billingPlan: 'FREE',
        currentTokens: 8000,
        cloudAccountCount: 1,
        awsAccountCount: 0,
        azureAccountCount: 0,
        gcpAccountCount: 1,
        ncpAccountCount: 0,
      },
    ];

    // 검색어가 있으면 필터링
    let filteredUsers = mockUsers;
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredUsers = mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedContent = filteredUsers.slice(startIndex, endIndex);

    return {
      content: paginatedContent,
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / size),
      size,
      number: page,
    };
  }

  const params: { page: number; size: number; search?: string } = { page, size };
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const response = await api.get('/admin/users', {
    params,
  });
  return response.data;
}

/**
 * 결제 내역 조회
 */
export async function getAdminPayments(search?: string): Promise<PaymentHistory[]> {
  // Mock 모드 처리
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const mockPayments: PaymentHistory[] = [
      {
        id: 1,
        userId: 1,
        userEmail: 'user1@example.com',
        userName: '홍길동',
        paymentType: 'MEMBERSHIP',
        impUid: 'imp_1234567890',
        amount: 4900,
        status: 'PAID',
        paidAt: '2024-01-15T10:31:00',
        createdAt: '2024-01-15T10:30:00',
        lastVerifiedAt: '2024-01-15T10:31:00',
      },
      {
        id: 2,
        userId: 3,
        userEmail: 'user3@example.com',
        userName: '이영희',
        paymentType: 'TOKEN_PURCHASE',
        impUid: 'imp_0987654321',
        amount: 10000,
        status: 'PAID',
        paidAt: '2024-02-15T14:21:00',
        createdAt: '2024-02-15T14:20:00',
        lastVerifiedAt: '2024-02-15T14:21:00',
      },
      {
        id: 3,
        userId: 5,
        userEmail: 'user5@example.com',
        userName: '정수진',
        paymentType: 'MEMBERSHIP',
        impUid: 'imp_1122334455',
        amount: 4900,
        status: 'PAID',
        paidAt: '2024-03-10T11:46:00',
        createdAt: '2024-03-10T11:45:00',
        lastVerifiedAt: '2024-03-10T11:46:00',
      },
      {
        id: 4,
        userId: 2,
        userEmail: 'user2@example.com',
        userName: '김철수',
        paymentType: 'TOKEN_PURCHASE',
        impUid: 'imp_2233445566',
        amount: 5000,
        status: 'PENDING',
        paidAt: null,
        createdAt: '2024-03-25T09:00:00',
        lastVerifiedAt: '2024-03-25T09:00:00',
      },
      {
        id: 5,
        userId: 1,
        userEmail: 'user1@example.com',
        userName: '홍길동',
        paymentType: 'TOKEN_PURCHASE',
        impUid: 'imp_3344556677',
        amount: 20000,
        status: 'PAID',
        paidAt: '2024-03-28T16:31:00',
        createdAt: '2024-03-28T16:30:00',
        lastVerifiedAt: '2024-03-28T16:31:00',
      },
      {
        id: 6,
        userId: 4,
        userEmail: 'user4@example.com',
        userName: '박민수',
        paymentType: 'MEMBERSHIP',
        impUid: 'imp_4455667788',
        amount: null, // MEMBERSHIP의 경우 amount는 null일 수 있음
        status: 'FAILED',
        paidAt: null,
        createdAt: '2024-04-01T10:00:00',
        lastVerifiedAt: '2024-04-01T10:05:00',
      },
      {
        id: 8,
        userId: 6,
        userEmail: 'user6@example.com',
        userName: '최지영',
        paymentType: 'MEMBERSHIP',
        impUid: null, // impUid가 null일 수 있음
        amount: null, // MEMBERSHIP의 경우 amount는 null
        status: 'IDLE',
        paidAt: null,
        createdAt: '2024-04-10T12:00:00',
        lastVerifiedAt: null,
      },
      {
        id: 7,
        userId: 3,
        userEmail: 'user3@example.com',
        userName: '이영희',
        paymentType: 'MEMBERSHIP',
        impUid: 'imp_5566778899',
        amount: 4900,
        status: 'PAID',
        paidAt: '2024-04-05T13:16:00',
        createdAt: '2024-04-05T13:15:00',
        lastVerifiedAt: '2024-04-05T13:16:00',
      },
    ];

    // 검색어가 있으면 필터링
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      return mockPayments.filter(
        (payment) =>
          payment.userName.toLowerCase().includes(searchLower) ||
          payment.userEmail.toLowerCase().includes(searchLower)
      );
    }

    return mockPayments;
  }

  const params: { search?: string } = {};
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const response = await api.get('/admin/payments', {
    params,
  });
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


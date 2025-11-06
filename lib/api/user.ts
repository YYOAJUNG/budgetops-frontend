// 사용자 정보 API 및 Mock 데이터

import { api } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  department?: string;
  position?: string;
  joinDate?: string;
  lastLogin?: string;
  avatarUrl?: string;
}

// Mock 사용자 데이터 (개발/테스트용)
export const mockUser: User = {
  id: '1',
  name: '김땡땡',
  email: 'user@example.com',
  company: 'BudgetOps',
  phone: '010-1234-5678',
  department: '개발팀',
  position: '시니어 엔지니어',
  joinDate: '2024-01-15',
  lastLogin: '2024-10-30T14:30:00',
};

// 사용자 정보 가져오기 (백엔드 API 호출)
export async function getCurrentUser(): Promise<User> {
  // Mock 모드인 경우 Mock 데이터 반환
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockUser;
  }

  try {
    // 백엔드 API 호출: /api/auth/user
    const response = await api.get('api/auth/user');
    return response.data;
  } catch (error: any) {
    // 401 Unauthorized인 경우 로그인하지 않은 상태
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

// 사용자 정보 업데이트
export async function updateUser(userData: Partial<User>): Promise<User> {
  // TODO: 실제 API 호출
  // const response = await fetch('/api/user/me', {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(userData),
  // });
  // return response.json();

  return { ...mockUser, ...userData };
}

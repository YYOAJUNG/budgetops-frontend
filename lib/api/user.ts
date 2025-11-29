// 사용자 정보 API 및 Mock 데이터

import { api } from './client';

export interface User {
  id: number;
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
  id: 1,
  name: '조예진',
  email: 'whdpwls@ajou.ac.kr',
  company: 'BudgetOps',
  phone: '010-1234-5678',
  department: '개발팀',
  position: '시니어 엔지니어',
  joinDate: '2024-01-15',
  lastLogin: '2024-10-30T14:30:00',
};

// 사용자 정보 가져오기 (백엔드 API 호출)
export async function getCurrentUser(): Promise<User> {
  try {
    // 백엔드 API 호출: /api/v1/users/me
    const response = await api.get('/v1/users/me');
    return response.data;
  } catch (error: any) {
    // 401 Unauthorized인 경우 로그인하지 않은 상태
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

// JWT는 stateless이므로 서버 측 로그아웃 API 호출 불필요
// 클라이언트에서 토큰만 삭제하면 됨 (store/auth.ts의 logout에서 처리)

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

// 회원 탈퇴
export async function deleteCurrentUser(): Promise<void> {
  await api.delete('/members/me');
}

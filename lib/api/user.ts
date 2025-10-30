// 사용자 정보 API 및 Mock 데이터

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

// Mock 사용자 데이터 (나중에 실제 API로 교체)
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

// 사용자 정보 가져오기 (나중에 실제 API 호출로 교체)
export async function getCurrentUser(): Promise<User> {
  // TODO: 실제 API 호출
  // const response = await fetch('/api/user/me');
  // return response.json();

  return mockUser;
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

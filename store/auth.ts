import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser } from '@/lib/api/user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setToken: (token: string) => void;
  removeToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        // JWT는 stateless이므로 서버 측 로그아웃 API 호출 불필요
        // 클라이언트에서 토큰만 삭제
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
        }
        // 로컬 상태 초기화
        set({ user: null, isAuthenticated: false });
      },
      setToken: (token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('jwt_token', token);
        }
      },
      removeToken: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
        }
      },
      checkAuth: async () => {
        // 이미 확인 중이면 중복 호출 방지
        if (get().isLoading) return;

        set({ isLoading: true });
        try {
            // Mock 모드인 경우 모의 사용자로 자동 로그인
          if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
            set({
              user: {
                id: 'mock-user-1',
                email: 'test@example.com',
                name: '테스트 사용자',
                role: 'user',
              },
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }

          // JWT 토큰이 없으면 인증 실패
          if (typeof window !== 'undefined' && !localStorage.getItem('jwt_token')) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          const userInfo = await getCurrentUser();
          const normalizedId = userInfo.id !== undefined && userInfo.id !== null
            ? String(userInfo.id)
            : '';
          // 백엔드에서 받은 사용자 정보를 상태에 저장
          set({
            user: {
              id: normalizedId,
              email: userInfo.email,
              name: userInfo.name,
              role: 'user', // 백엔드 응답에 role이 있으면 그걸 사용
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // 로그인하지 않았거나 토큰이 만료된 경우
          // 토큰 삭제
          if (typeof window !== 'undefined') {
            localStorage.removeItem('jwt_token');
          }
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'budgetops-auth',
    }
  )
);

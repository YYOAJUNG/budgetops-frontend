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
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      checkAuth: async () => {
        // 이미 확인 중이면 중복 호출 방지
        if (get().isLoading) return;

        set({ isLoading: true });
        try {
          // Mock 모드인 경우 스킵
          if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
            set({ isLoading: false });
            return;
          }

          const userInfo = await getCurrentUser();
          // 백엔드에서 받은 사용자 정보를 상태에 저장
          set({
            user: {
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              role: 'user', // 백엔드 응답에 role이 있으면 그걸 사용
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // 로그인하지 않았거나 세션이 만료된 경우
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

import { create } from 'zustand';

export interface ErrorInfo {
  id: string;
  type: 'api' | 'network' | 'validation' | 'auth' | 'general';
  title: string;
  message: string;
  details?: string;
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface ErrorStore {
  errors: ErrorInfo[];
  addError: (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  clearErrorsByType: (type: ErrorInfo['type']) => void;
}

export const useErrorStore = create<ErrorStore>((set, get) => ({
  errors: [],
  
  addError: (error) => {
    const newError: ErrorInfo = {
      ...error,
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      dismissible: error.dismissible ?? true,
      autoClose: error.autoClose ?? false,
      autoCloseDelay: error.autoCloseDelay ?? 5000,
    };
    
    set((state) => ({
      errors: [...state.errors, newError]
    }));

    // 자동 닫기 설정된 경우
    if (newError.autoClose) {
      setTimeout(() => {
        get().removeError(newError.id);
      }, newError.autoCloseDelay);
    }
  },
  
  removeError: (id) => {
    set((state) => ({
      errors: state.errors.filter(error => error.id !== id)
    }));
  },
  
  clearAllErrors: () => {
    set({ errors: [] });
  },
  
  clearErrorsByType: (type) => {
    set((state) => ({
      errors: state.errors.filter(error => error.type !== type)
    }));
  },
}));

// 편의 함수들
export const showError = (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => {
  useErrorStore.getState().addError(error);
};

export const showApiError = (message: string, details?: string) => {
  showError({
    type: 'api',
    title: 'API 오류',
    message,
    details,
  });
};

export const showNetworkError = () => {
  showError({
    type: 'network',
    title: '네트워크 오류',
    message: '인터넷 연결을 확인해주세요.',
    action: {
      label: '다시 시도',
      onClick: () => window.location.reload(),
    },
  });
};

export const showValidationError = (message: string) => {
  showError({
    type: 'validation',
    title: '입력 오류',
    message,
    autoClose: true,
    autoCloseDelay: 3000,
  });
};

export const showAuthError = (message: string) => {
  showError({
    type: 'auth',
    title: '인증 오류',
    message,
    action: {
      label: '로그인 페이지로',
      onClick: () => window.location.href = '/login',
    },
  });
};

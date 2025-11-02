import axios from 'axios';

// 백엔드 베이스 URL 추출 (API_BASE_URL에서 /api 제거)
// 기본값은 배포된 api.budgetops.work 사용
const getBackendBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.budgetops.work/api';
  // /api로 끝나면 제거, 아니면 그대로 사용
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl.replace(/\/api$/, '');
};

// API 기본 URL 설정 - 기본값은 배포된 api.budgetops.work 사용
const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.budgetops.work/api';
};

export const api = axios.create({ 
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock mode interceptor (토큰 인터셉터보다 먼저 등록하여 먼저 실행)
if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
  api.interceptors.request.use((config) => {
    console.log('[MOCK] API Request:', config.url);
    return config;
  });
}

// JWT 토큰 인터셉터: 모든 요청에 토큰 자동 추가
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 401 응답 처리: 토큰 만료 시 로그아웃
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      // 로그인 페이지로 리다이렉트하지 않고 에러만 반환 (각 컴포넌트에서 처리)
    }
    return Promise.reject(error);
  }
);

// 백엔드 베이스 URL 내보내기 (OAuth 등에 사용)
export const BACKEND_BASE_URL = getBackendBaseUrl();


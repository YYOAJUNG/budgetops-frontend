import axios from 'axios';

// 환경 변수에서 API Base URL 가져오기
const getApiBaseUrl = () => {
  // 환경 변수 우선순위: NEXT_PUBLIC_API_BASE_URL > NEXT_PUBLIC_API_BASE > 기본값
  const apiBase = 
    process.env.NEXT_PUBLIC_API_BASE_URL || 
    process.env.NEXT_PUBLIC_API_BASE || 
    'https://api.budgetops.work';
  
  // /api가 이미 포함되어 있지 않으면 추가
  return apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // JWT 사용 시 withCredentials 불필요 (쿠키 대신 헤더 사용)
});

// JWT 토큰을 모든 요청에 자동으로 추가하는 인터셉터
api.interceptors.request.use(
  (config) => {
    // localStorage에서 JWT 토큰 가져오기
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    
    if (token) {
      // Authorization 헤더에 Bearer 토큰 추가
      config.headers.Authorization = `Bearer ${token}`;
      // 디버깅: 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Request]', {
          url: config.url,
          baseURL: config.baseURL,
          hasToken: !!token,
          tokenPreview: token.substring(0, 20) + '...',
        });
      }
    } else {
      // 토큰이 없는 경우 경고 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        console.warn('[API Request] No JWT token found in localStorage', {
          url: config.url,
          baseURL: config.baseURL,
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 401 에러 시 토큰 삭제 및 로그인 페이지로 리다이렉트
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 토큰 삭제
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
        // 필요시 로그인 페이지로 리다이렉트
        // window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);


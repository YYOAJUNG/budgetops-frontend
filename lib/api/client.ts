import axios from 'axios';

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 중요! 쿠키를 포함하여 세션 유지
});
 
// Mock mode interceptor
if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
  api.interceptors.request.use((config) => {
    console.log('[MOCK] API Request:', config.url);
    return config;
  });
}


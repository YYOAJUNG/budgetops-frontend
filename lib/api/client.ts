import axios from 'axios';

export const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// Mock mode interceptor
if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
  api.interceptors.request.use((config) => {
    console.log('[MOCK] API Request:', config.url);
    return config;
  });
}


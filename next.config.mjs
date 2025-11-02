/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 백엔드 API URL - 기본값은 배포된 api.budgetops.work 사용
    // 로컬 백엔드 사용 시: NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api npm run dev
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.budgetops.work/api',
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || 'true',
  },
};

export default nextConfig;


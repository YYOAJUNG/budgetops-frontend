/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 환경 변수가 설정되지 않으면 기본값 사용 (lib/api/client.ts에서 처리)
    // next.config.mjs에서는 환경 변수를 그대로 전달만 함
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || 'true',
  },
};

export default nextConfig;


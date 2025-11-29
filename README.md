## BudgetOps FE (Next.js 14)

### 개요
BudgetOps 프론트엔드 애플리케이션입니다. Next.js(App Router)와 Tailwind, Radix UI, TanStack Query, Zustand를 사용하며 백엔드(`budgetops-be`)의 REST API와 연동합니다.

### 기술 스택
- **Framework**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS, tailwindcss-animate, Radix UI
- **State/Data**: TanStack Query, Zustand
- **언어/도구**: TypeScript, ESLint

### 요구사항
- Node.js 18+ (권장 18 LTS 이상)
- npm 9+ 또는 pnpm/yarn (예시는 npm 기준)

### 설치
```bash
npm ci    # 또는 npm install
```

### 환경 변수 설정(.env.local)
프로젝트 루트(`budgetops-fe/`)에 `.env.local` 파일을 생성하여 API 엔드포인트와 모의 데이터 사용 여부를 설정합니다.

```bash
# 프로덕션 API URL (기본값)
NEXT_PUBLIC_API_BASE_URL=https://api.budgetops.work/api

# 로컬 개발 시에는 아래와 같이 설정:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# 모의 데이터 사용 여부
# true  -> 일부 API 호출이 콘솔 로그와 함께 목 데이터로 동작
# false -> 실제 백엔드 API 호출
NEXT_PUBLIC_USE_MOCK=false
```

주의: 기본값은 프로덕션 URL(`https://api.budgetops.work/api`)입니다. 로컬 개발 시에만 `.env.local`에서 `NEXT_PUBLIC_API_BASE_URL`을 `http://localhost:8080/api`로 변경하세요.

### 실행(개발)
```bash
npm run dev
```
기본 포트: `http://localhost:3000`

### 빌드/프로덕션 실행
```bash
npm run build
npm run start   # 기본 3000 포트, NEXT_PUBLIC_* 환경변수 적용
```

### 스크립트
- **dev**: 개발 서버 실행 (Next.js)
- **build**: 프로덕션 빌드
- **start**: 프로덕션 서버 실행
- **lint**: ESLint 체크

### 디렉터리 구조(요약)
- `app/`: App Router 페이지 구성 (`dashboard`, `accounts`, `costs/*`, `reports`, `recommendations`, `copilot`, `mypage`, `onboarding`, `simulators/db-billing` 등)
- `components/`: UI 및 도메인 컴포넌트
- `lib/api/`: API 클라이언트 래퍼 및 엔드포인트 함수 (`client.ts`, `aws.ts`, `user.ts`, `subscription.ts` 등)
- `store/`: Zustand 스토어(`auth.ts`, `ui.ts` 등)
- `hooks/`: 커스텀 훅(`useAccountLinking.ts` 등)
- `constants/`, `types/`: 상수/타입 정의
- `public/`: 정적 리소스
- `tailwind.config.ts`, `postcss.config.mjs`: 스타일 설정
- `next.config.mjs`: Next 설정 및 `NEXT_PUBLIC_*` 기본값

### API 연동 및 주의사항
- 기본 Base URL은 `lib/api/client.ts`에서 `https://api.budgetops.work/api`로 설정됩니다.
- 로컬 개발 시에는 `.env.local`에서 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`로 설정하세요.
- CORS 이슈 발생 시 백엔드의 CORS 설정(`WebCorsConfig`) 또는 프론트의 프록시 설정을 확인하세요.

### 모의 데이터(Mock) 사용
- `NEXT_PUBLIC_USE_MOCK === 'true'`일 때, `lib/api/client.ts`에서 인터셉터가 활성화되어 요청을 로그합니다.
- 일부 API(`lib/api/user.ts`, `lib/api/subscription.ts`)는 실제 백엔드가 준비되기 전까지 목 데이터를 반환하도록 구성되어 있습니다.
- 실제 API 연결 시 `.env.local`에서 `NEXT_PUBLIC_USE_MOCK=false`로 설정하세요.

### 트러블슈팅
- **백엔드 연결 안 됨**: 프로덕션은 `https://api.budgetops.work/api`를 사용합니다. 로컬 개발 시 `.env.local`의 `NEXT_PUBLIC_API_BASE_URL`이 백엔드 포트와 일치하는지 확인(예: `http://localhost:8080/api`).
- **CORS 오류**: 백엔드 CORS 허용 도메인/메서드 확인. 개발 중에는 `http://localhost:3000` 허용 필요.
- **타입 오류/린트 실패**: `npm run lint`로 확인 후 경고/오류 수정.
- **빌드 실패**: Node 버전(18+) 및 TypeScript/Next 버전 호환 여부 확인.

### 라이선스
내부 사용 목적. 별도 고지 없을 시 사내 정책을 따릅니다.



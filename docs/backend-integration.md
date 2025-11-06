# 프론트엔드-백엔드 연결 가이드

이 문서는 BudgetOps 프론트엔드와 백엔드를 OAuth 로그인을 통해 연결하는 과정과 변경 사항을 상세히 설명합니다.

## 목차

1. [개요](#개요)
2. [변경된 파일 목록](#변경된-파일-목록)
3. [상세 변경 내용](#상세-변경-내용)
4. [환경 설정](#환경-설정)
5. [로컬 테스트 방법](#로컬-테스트-방법)
6. [트러블슈팅](#트러블슈팅)

---

## 개요

프론트엔드와 백엔드를 연결하여 OAuth 2.0 기반 Google 로그인을 구현했습니다. 주요 변경사항은 다음과 같습니다:

- OAuth 콜백 페이지 생성
- API 클라이언트에 세션 쿠키 지원 추가
- 인증 상태 관리 개선
- 사용자 정보 API 연동

---

## 변경된 파일 목록

### 새로 생성된 파일
- `app/oauth/callback/page.tsx` - OAuth 로그인 콜백 처리 페이지

### 수정된 파일
1. `lib/api/client.ts` - API 클라이언트 설정 (credentials 추가)
2. `lib/api/user.ts` - 사용자 정보 API 함수 구현
3. `store/auth.ts` - 인증 상태 관리 개선 (checkAuth 함수 추가)
4. `components/auth/ProtectedRoute.tsx` - 인증 상태 확인 로직 추가
5. `app/page.tsx` - Google 로그인 버튼 리다이렉트 수정
6. `next.config.mjs` - API Base URL 기본값 변경

---

## 상세 변경 내용

### 1. OAuth 콜백 페이지 생성 (`app/oauth/callback/page.tsx`)

OAuth 로그인 성공 후 백엔드에서 리다이렉트되는 페이지입니다.

**주요 기능:**
- URL 파라미터에서 오류 확인
- 백엔드 API(`/api/auth/user`)로 사용자 정보 가져오기
- 인증 상태에 사용자 정보 저장
- 성공 시 대시보드로, 실패 시 홈으로 리다이렉트

**코드 구조:**
```typescript
// URL 파라미터에서 오류 확인
const error = searchParams.get('error');

// 사용자 정보 가져오기
const userInfo = await getCurrentUser();

// 인증 상태에 저장 후 대시보드로 이동
login({ id, email, name, role });
router.replace('/dashboard');
```

---

### 2. API 클라이언트 설정 (`lib/api/client.ts`)

**변경 전:**
```typescript
export const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**변경 후:**
```typescript
export const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 중요! 쿠키를 포함하여 세션 유지
});
```

**주요 변경사항:**
- `withCredentials: true` 추가 - 세션 쿠키가 모든 요청에 포함되도록 설정
- 기본 URL을 백엔드 포트(`8080`)로 변경
- `/api` 경로 제거 (각 엔드포인트에서 직접 지정)

---

### 3. 사용자 정보 API 함수 구현 (`lib/api/user.ts`)

**변경 전:**
```typescript
export async function getCurrentUser(): Promise<User> {
  // TODO: 실제 API 호출
  return mockUser;
}
```

**변경 후:**
```typescript
export async function getCurrentUser(): Promise<User> {
  // Mock 모드인 경우 Mock 데이터 반환
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockUser;
  }

  try {
    // 백엔드 API 호출: /api/auth/user
    const response = await api.get('/auth/user');
    return response.data;
  } catch (error: any) {
    // 401 Unauthorized인 경우 로그인하지 않은 상태
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}
```

**주요 변경사항:**
- 실제 백엔드 API 호출 구현
- Mock 모드 지원 유지
- 401 에러 처리 추가

---

### 4. 인증 상태 관리 개선 (`store/auth.ts`)

**변경 전:**
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}
```

**변경 후:**
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>; // 새로 추가
}
```

**새로 추가된 `checkAuth` 함수:**
```typescript
checkAuth: async () => {
  set({ isLoading: true });
  try {
    const userInfo = await getCurrentUser();
    set({
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        role: 'user',
      },
      isAuthenticated: true,
      isLoading: false,
    });
  } catch (error) {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
}
```

**주요 변경사항:**
- `isLoading` 상태 추가
- `checkAuth()` 함수로 앱 시작 시 인증 상태 확인
- 초기 상태를 `null`/`false`로 변경 (기존 하드코딩된 사용자 정보 제거)

---

### 5. ProtectedRoute 개선 (`components/auth/ProtectedRoute.tsx`)

**변경 전:**
```typescript
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);
  // ...
}
```

**변경 후:**
```typescript
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    const verifyAuth = async () => {
      await checkAuth();
      setHasCheckedAuth(true);
    };
    if (!hasCheckedAuth) {
      verifyAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  // 인증 확인이 완료된 후 로그인하지 않은 경우 홈으로 리다이렉트
  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated && !isLoading) {
      router.replace('/');
    }
  }, [hasCheckedAuth, isAuthenticated, isLoading, router]);
  // ...
}
```

**주요 변경사항:**
- 마운트 시 백엔드에서 인증 상태 자동 확인
- 세션 유효성 검증
- 로딩 상태 처리

---

### 6. 메인 페이지 로그인 버튼 수정 (`app/page.tsx`)

**변경 전:**
```typescript
const handleGoogleLogin = () => {
  window.location.href = '/api/auth/google';
};
```

**변경 후:**
```typescript
const handleGoogleLogin = () => {
  // 백엔드 OAuth 로그인 엔드포인트로 리다이렉트
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  
  // /api/auth/google 경로로 리다이렉트
  window.location.href = `${apiBaseUrl}/auth/google`;
};
```

**주요 변경사항:**
- 백엔드 API URL로 직접 리다이렉트
- 환경 변수 지원

---

### 7. Next.js 설정 파일 수정 (`next.config.mjs`)

**변경 전:**
```javascript
NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
```

**변경 후:**
```javascript
NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
```

**주요 변경사항:**
- 기본값을 백엔드 포트(`8080`)로 변경
- `/api` 경로 제거 (각 API 호출에서 직접 지정)

---

## 환경 설정

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성합니다:

```bash
# 백엔드 API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Mock 모드 사용 여부 (백엔드 연결 시 false로 설정)
NEXT_PUBLIC_USE_MOCK=false
```

**참고:** `.env.local.example` 파일이 `docs/` 디렉토리에 있습니다.

### 2. 백엔드 설정 확인

백엔드에서 다음 설정이 필요합니다:

#### CORS 설정
백엔드의 `SecurityConfig.java`에서 프론트엔드 포트를 허용해야 합니다:

```java
.allowedOrigins("http://localhost:3000") // 프론트엔드 포트
```

#### OAuth 리다이렉트 URI 설정
백엔드의 `application-local.yml`에서 리다이렉트 URI를 설정해야 합니다:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            redirect-uri: http://localhost:3000/oauth/callback
```

---

## 로컬 테스트 방법

### 1. 백엔드 실행

```bash
# 백엔드 프로젝트 디렉토리로 이동
cd budgetops-backend

# 로컬 프로필로 실행
./gradlew bootRun --args='--spring.profiles.active=local'
```

백엔드가 `http://localhost:8080`에서 실행되어야 합니다.

### 2. 프론트엔드 실행

```bash
# 프론트엔드 프로젝트 디렉토리로 이동
cd budgetops-frontend

# 환경 변수 파일 확인 또는 생성
# .env.local 파일이 존재하고 올바른 설정이 있는지 확인

# 개발 서버 실행
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행되어야 합니다.

### 3. 로그인 플로우 테스트

1. **브라우저에서 `http://localhost:3000` 접속**
   - 메인 페이지(랜딩 페이지)가 표시됩니다.

2. **"Google로 계속하기" 버튼 클릭**
   - 브라우저가 `http://localhost:8080/auth/google`로 리다이렉트됩니다.
   - Google OAuth 로그인 페이지가 표시됩니다.

3. **Google 계정으로 로그인**
   - Google 계정 선택 및 로그인
   - 권한 승인

4. **콜백 페이지로 리다이렉트**
   - 성공 시 `http://localhost:3000/oauth/callback`로 리다이렉트됩니다.
   - "로그인 처리 중..." 메시지가 표시됩니다.

5. **사용자 정보 가져오기**
   - 백엔드 API(`/api/auth/user`)로 사용자 정보를 가져옵니다.
   - 인증 상태에 저장됩니다.

6. **대시보드로 이동**
   - 사용자 정보 저장 후 자동으로 `/dashboard`로 리다이렉트됩니다.

### 4. 인증 상태 확인 테스트

1. **로그인 상태 확인**
   - 브라우저 개발자 도구 → Application → Cookies
   - 세션 쿠키가 설정되어 있는지 확인

2. **페이지 새로고침**
   - 대시보드 페이지에서 새로고침
   - `ProtectedRoute`가 자동으로 인증 상태를 확인합니다.
   - 세션이 유효하면 로그인 상태 유지

3. **로그아웃 테스트**
   - 로그아웃 버튼 클릭
   - 인증 상태가 초기화되고 홈으로 이동

---

## 트러블슈팅

### 1. CORS 오류

**증상:**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/user' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**해결 방법:**
- 백엔드의 CORS 설정에서 `http://localhost:3000`을 허용해야 합니다.
- `SecurityConfig.java` 파일 확인

### 2. 세션 쿠키가 전송되지 않음

**증상:**
- 로그인 후에도 401 에러가 발생
- 사용자 정보를 가져올 수 없음

**해결 방법:**
- `lib/api/client.ts`에서 `withCredentials: true`가 설정되어 있는지 확인
- 브라우저 개발자 도구에서 쿠키가 설정되어 있는지 확인
- 백엔드에서 쿠키 설정이 올바른지 확인 (SameSite, Secure 등)

### 3. 리다이렉트 URI 불일치

**증상:**
```
OAuth2 authorization failed: redirect_uri_mismatch
```

**해결 방법:**
- 백엔드의 `application-local.yml`에서 `redirect-uri`가 `http://localhost:3000/oauth/callback`로 설정되어 있는지 확인
- Google Cloud Console에서 승인된 리다이렉트 URI 확인

### 4. `/api/api/auth/google` 같은 중복 경로 오류

**증상:**
```
GET /api/api/auth/google 404
```

**해결 방법:**
- `NEXT_PUBLIC_API_BASE_URL`이 이미 `/api`를 포함하는지 확인
- `app/page.tsx`에서 경로 구성 확인
- `lib/api/client.ts`의 `baseURL` 확인

### 5. 환경 변수가 적용되지 않음

**증상:**
- 환경 변수를 변경했는데도 반영되지 않음

**해결 방법:**
- 개발 서버를 재시작해야 합니다 (`Ctrl+C` 후 `npm run dev` 다시 실행)
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일명이 정확한지 확인 (`.env.local`, `.env.local.example` 아님)

### 6. Mock 모드와 실제 API 모드 구분

**Mock 모드(`NEXT_PUBLIC_USE_MOCK=true`):**
- 실제 백엔드 API 호출 없이 Mock 데이터 사용
- 콘솔에 `[MOCK] API Request:` 로그 출력

**실제 API 모드(`NEXT_PUBLIC_USE_MOCK=false`):**
- 백엔드 API 호출
- 세션 쿠키를 사용한 인증

---

## API 엔드포인트 참고

### 백엔드 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/auth/google` | GET | Google OAuth 로그인 시작 |
| `/api/auth/user` | GET | 현재 로그인한 사용자 정보 가져오기 |
| `/oauth/callback` | GET | OAuth 콜백 (프론트엔드 페이지) |

### 프론트엔드 API 호출

```typescript
// 사용자 정보 가져오기
import { getCurrentUser } from '@/lib/api/user';
const user = await getCurrentUser();

// API 클라이언트 직접 사용
import { api } from '@/lib/api/client';
const response = await api.get('/auth/user');
```

---

## 추가 참고 자료

- [OAuth 2.0 인증 흐름](https://oauth.net/2/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Axios withCredentials](https://axios-http.com/docs/config_defaults)

---

## 변경 이력

- **2024-01-XX**: 초기 프론트엔드-백엔드 연결 구현
  - OAuth 콜백 페이지 생성
  - API 클라이언트 세션 쿠키 지원 추가
  - 인증 상태 관리 개선


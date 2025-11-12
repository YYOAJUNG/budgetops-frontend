# 클라우드 계정 연동 UI 사양

## 개요

사용자는 API Key 입력 또는 OAuth 버튼을 통해 클라우드 계정을 연동할 수 있습니다.

## 지원 프로바이더

| 프로바이더 | OAuth 지원 | 필수 필드 | 선택적 필드 |
|-----------|-----------|----------|------------|
| AWS | ❌ | Access Key ID, Secret Access Key | Region |
| GCP | ✅ | Project ID | Service Account Key |
| Azure | ✅ | Subscription ID, Client ID, Client Secret, Tenant ID | - |
| NCP | ❌ | Access Key, Secret Key | Region |

## UI 구조

### 1. 탭 구조
- 4개 프로바이더 탭 (AWS, GCP, Azure, NCP)
- 각 탭에 해당 프로바이더의 연동 폼 표시
- 탭 전환 시 상태 유지

### 2. API Key 입력 폼

#### 공통 필드
- **계정 이름**: 연결할 계정의 식별 이름 (필수)

#### AWS
- **Access Key ID**: AWS 액세스 키 ID (필수)
- **Secret Access Key**: AWS 시크릿 액세스 키 (필수)
- **Region**: AWS 리전 (선택)

#### GCP
- **Project ID**: Google Cloud 프로젝트 ID (필수)
- **Service Account Key**: 서비스 계정 키 JSON (선택)

#### Azure
- **Subscription ID**: Azure 구독 ID (필수)
- **Client ID**: Azure 애플리케이션 클라이언트 ID (필수)
- **Client Secret**: Azure 애플리케이션 클라이언트 시크릿 (필수)
- **Tenant ID**: Azure 테넌트 ID (필수)
- **튜토리얼**: [Azure 계정 연동 안내](./azure-account-tutorial.md)

#### NCP
- **Access Key**: 네이버 클라우드 플랫폼 액세스 키 (필수)
- **Secret Key**: 네이버 클라우드 플랫폼 시크릿 키 (필수)
- **Region**: NCP 리전 (선택)

### 3. OAuth 연동

#### 지원 프로바이더
- **GCP**: Google OAuth 2.0 플로우
- **Azure**: Microsoft OAuth 2.0 플로우

#### UI 동작
- OAuth 지원 프로바이더에서만 "OAuth로 연동" 버튼 표시
- 클릭 시 OAuth 플로우 시작 (현재는 스텁)

## 유효성 검사

### 필수 필드 검증
- 모든 필수 필드가 입력되어야 "계정 연동" 버튼 활성화
- 필드별 실시간 유효성 검사
- 에러 메시지 표시

### 접근성
- 모든 입력 필드에 `label` 연결
- 에러 상태에서 `aria-invalid` 속성 설정
- 키보드 네비게이션 지원

## 반응형 디자인

### 데스크탑 (lg 이상)
- 2열 레이아웃: 왼쪽 연동 폼, 오른쪽 연결된 계정 목록
- 탭 레이블과 아이콘 모두 표시

### 모바일 (sm 이하)
- 1열 레이아웃: 연동 폼과 계정 목록이 세로로 배치
- 탭에서 텍스트 숨김, 아이콘만 표시

## 상태 관리

### 로컬 상태
- 폼 데이터는 로컬 상태로 관리
- 탭 전환 시 입력 데이터 유지
- 연동 성공/실패 상태 표시

### API 연동 (스텁)
- 연동 버튼 클릭 시 2초 로딩 시뮬레이션
- 성공 시 알림 메시지 표시
- 실패 시 에러 메시지 표시

## 컴포넌트 구조

```
components/accounts/
├── Accounts.tsx          # 메인 컴포넌트
├── AccountForm.tsx       # 연동 폼 컴포넌트
└── AccountList.tsx       # 연결된 계정 목록

lib/config/
└── providers.ts          # 프로바이더 설정

types/
└── accounts.ts           # 타입 정의
```

## 테스트 시나리오

### 1. 탭 전환 테스트
- 각 프로바이더 탭 클릭 시 해당 폼 표시
- 탭 전환 후 입력 데이터 유지

### 2. 유효성 검사 테스트
- 필수 필드 미입력 시 연동 버튼 비활성화
- 모든 필수 필드 입력 시 연동 버튼 활성화

### 3. OAuth 테스트
- GCP/Azure 탭에서 OAuth 버튼 표시 확인
- OAuth 버튼 클릭 시 스텁 플로우 실행

### 4. 연동 테스트
- 유효한 데이터 입력 후 연동 버튼 클릭
- 로딩 상태 표시 및 성공 메시지 확인

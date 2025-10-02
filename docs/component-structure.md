## React + TypeScript 컴포넌트 구조 제안

프로젝트 규모 확장을 고려한 권장 구조입니다. 현 `src/components` 자산은 유지하되, 신규 개발은 아래 구조를 우선합니다.

```
src/
  assets/               # 이미지, 폰트, 정적 리소스
  components/
    common/             # 버튼, 입력 등 범용 UI 래퍼
    layout/             # 레이아웃, 헤더/푸터/사이드바
  features/             # 도메인 단위(예: cost, resource, auth)
    cost/
      components/
      hooks/
      pages/
      services/
      types.ts
      index.ts
    resource/
      ...
  hooks/                # 재사용 가능한 커스텀 훅
  lib/                  # 비 UI 유틸, API 클라이언트, fetcher 등
  pages/                # 라우팅되는 페이지(라우터 사용 시)
  routes/               # 라우터 설정
  services/             # 공용 서비스(API, 스토리지)
  store/                # 전역 상태(zustand/redux 등)
  styles/               # 전역 스타일 및 테마
  types/                # 전역 타입 선언
  utils/                # 범용 유틸리티 함수
```

### 가이드
- 기능은 `features/<domain>`으로 캡슐화하여 결합도↓, 응집도↑
- 범용 UI는 `components/common`, 레이아웃은 `components/layout`
- API 호출은 `services` 또는 각 `features/*/services`에 배치
- 타입은 도메인 단위 `types.ts` 또는 전역 `types/`
- 라우팅은 `routes/`에서 중앙 관리

### 마이그레이션 제안
- 기존 `src/components`의 범용 컴포넌트는 `components/common`으로 점진 이동
- `Sidebar` 등 레이아웃성 컴포넌트는 `components/layout`으로 이동
- 도메인 뷰(예: `CostAnalysis`, `ResourceManagement`)는 각 `features`로 이동 후 `pages`로 노출



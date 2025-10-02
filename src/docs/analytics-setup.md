# Analytics 설정 가이드 (GA4 + GTM)

CloudDash 애플리케이션에 Google Analytics GA4와 Google Tag Manager가 완전히 구현되어 있습니다.

## 현재 구현 상태

✅ **완료된 기능들:**
- GA4 + GTM 통합 초기화
- 페이지 뷰 자동 추적 (dataLayer + gtag)
- 버튼 클릭 이벤트 추적
- 로그인 이벤트 추적
- 사용자 정의 이벤트 추적
- CloudDash 전용 이벤트 추적
- 개발/운영 환경 분리
- 콘솔 로그를 통한 디버깅
- GTM dataLayer 활용한 향상된 데이터 수집

## 설정 방법

### 1. 측정 ID 및 GTM 컨테이너 ID 설정

`/utils/config.ts` 파일에서 실제 ID들로 교체:

```typescript
analytics: {
  // GA4 측정 ID (이미 설정됨)
  gaTrackingId: process.env.NODE_ENV === 'production' 
    ? 'G-RVX49ZBSWG' // 설정 완료
    : 'G-RVX49ZBSWG',
  
  // GTM 컨테이너 ID (새로 설정 필요)
  gtmContainerId: process.env.NODE_ENV === 'production'
    ? 'GTM-XXXXXXX' // 실제 GTM 컨테이너 ID로 교체
    : 'GTM-XXXXXXX',
}
```

### 2. Google Tag Manager 설정

#### GTM 컨테이너 생성
1. [Google Tag Manager](https://tagmanager.google.com/) 접속
2. "계정 만들기" 클릭
3. 계정 이름: "CloudDash"
4. 컨테이너 이름: "CloudDash Web App"
5. 타겟 플랫폼: "웹" 선택
6. 컨테이너 ID 확인 (GTM-XXXXXXX 형식)
7. `/utils/config.ts`에 컨테이너 ID 설정

#### GTM에서 GA4 태그 설정 (권장)
1. GTM 대시보드에서 "태그" → "새로 만들기"
2. 태그 유형: "Google Analytics: GA4 구성"
3. 측정 ID: `G-RVX49ZBSWG` 입력
4. 트리거: "All Pages" 선택
5. 저장 및 "제출" → "게시"

#### GTM에서 이벤트 태그 설정 (선택사항)
1. "태그" → "새로 만들기"
2. 태그 유형: "Google Analytics: GA4 이벤트"
3. 구성 태그: 위에서 만든 GA4 구성 선택
4. 이벤트 이름: `{{Event}}` (내장 변수)
5. 트리거: "All Custom Events" 또는 특정 이벤트
6. 저장 및 게시

## 추적되는 이벤트들

### 표준 이벤트 (GTM dataLayer + GA4)

#### 자동 추적 이벤트
- **page_view**: 페이지 방문시 자동 추적
- **button_click**: 모든 버튼 클릭 추적 (향상된 데이터)
- **login**: 사용자 로그인시 추적

#### CloudDash 전용 이벤트
- **clouddash_interaction**: CloudDash 특화 상호작용
  - `resource_view`: 리소스 조회
  - `cost_analysis`: 비용 분석
  - `ai_suggestion`: AI 제안
  - `dashboard_action`: 대시보드 액션

### 이벤트 데이터 구조 (Enhanced)

모든 이벤트는 다음 정보를 포함합니다:
```javascript
{
  event: 'event_name',
  timestamp: '2024-01-01T00:00:00.000Z',
  page_location: 'https://example.com/page',
  page_title: 'Page Title',
  page_path: '/page',
  app_name: 'CloudDash',
  app_version: '1.0.0',
  // 추가 이벤트별 데이터
}
```

## 이중 수집 시스템

### GTM dataLayer (주요 수집 방식)
- 모든 이벤트가 `window.dataLayer`에 푸시
- GTM에서 GA4로 자동 전송
- 유연한 태그 관리 가능
- 추가 마케팅 도구 연동 용이

### Direct GA4 (백업 수집 방식)  
- GTM 로드 실패시 백업
- `window.gtag` 직접 호출
- 기본적인 GA4 기능 제공

## 구현 세부사항

### 주요 함수들
- `initAnalytics()`: GA4 + GTM 통합 초기화
- `initGTM()`: GTM 전용 초기화
- `initGA()`: GA4 전용 초기화 (백업용)
- `trackPageView()`: 향상된 페이지 뷰 추적
- `trackButtonClick()`: 향상된 버튼 클릭 추적
- `trackCloudDashEvent()`: CloudDash 전용 이벤트

### 라이브러리
- Google Tag Manager (gtm.js)
- Google Analytics 4 (gtag.js) - 백업용
- Custom dataLayer implementation

## 확인 방법

### 1. 개발자 도구 콘솔
모든 이벤트가 상세하게 로그됩니다:
```
📊 Analytics Event: { event: 'button_click', timestamp: '...', ... }
📊 CloudDash Event: { event: 'clouddash_interaction', ... }
🚀 GTM Initialized: GTM-XXXXXXX
🚀 GA4 Initialized: G-RVX49ZBSWG
```

### 2. GTM Preview Mode (강력 추천!)
1. GTM 대시보드에서 "미리보기" 클릭
2. 애플리케이션 URL 입력
3. 실시간으로 dataLayer 이벤트 확인
4. 태그 실행 상태 확인

### 3. GA4 실시간 보고서
1. Google Analytics → 보고서 → 실시간
2. 이벤트별 실시간 데이터 확인
3. 향상된 이벤트 매개변수 확인

### 4. GTM 디버그 콘솔
브라우저 콘솔에서 직접 확인:
```javascript
// dataLayer 내용 확인
console.log(window.dataLayer);

// GTM 로드 상태 확인
console.log(window.google_tag_manager);

// 수동 이벤트 테스트
window.dataLayer.push({
  event: 'test_event',
  test_data: 'hello world'
});
```

## 설정 완료 체크리스트

- [ ] **GTM 컨테이너 생성 완료**
- [ ] **GTM 컨테이너 ID를 `/utils/config.ts`에 설정**
  ```typescript
  gtmContainerId: 'GTM-XXXXXXX' // 실제 ID로 교체
  ```
- [ ] **GTM에서 GA4 구성 태그 생성 및 게시**
- [ ] **애플리케이션 테스트 및 이벤트 확인**
- [ ] **GTM Preview Mode로 dataLayer 확인**
- [ ] **GA4 실시간 보고서에서 데이터 확인**
- [ ] **운영 환경 배포**

## 장점

### GTM 사용의 이점
- **유연성**: 코드 수정 없이 태그 관리
- **안정성**: 여러 수집 방식의 백업
- **확장성**: 추가 마케팅 도구 연동 용이
- **데이터 품질**: 향상된 이벤트 구조
- **디버깅**: GTM Preview Mode로 쉬운 문제 해결

### 이중 수집의 이점
- **안정성**: GTM 실패시 GA4 직접 수집
- **호환성**: 기존 GA4 코드와 완전 호환
- **디버깅**: 다양한 방식으로 문제 진단 가능

## 추가 설정 옵션

### Enhanced Ecommerce (필요시)
GTM에서 향후 전자상거래 추적도 쉽게 추가 가능

### Custom Dimensions (추천)
GA4에서 CloudDash 특화 맞춤 측정기준 설정:
- 사용자 역할 (관리자/일반사용자)
- 클라우드 제공업체 (AWS/Azure/GCP)
- 비용 임계값 설정

### Conversion Goals
중요한 사용자 행동을 전환으로 설정:
- AI 추천 클릭
- 비용 절약 액션 실행
- 리포트 다운로드

## 문의사항

설정이나 이벤트 추적에 문제가 있다면:
1. **브라우저 콘솔에서 초기화 로그 확인**
2. **GTM Preview Mode에서 dataLayer 확인**  
3. **GA4 실시간 보고서에서 데이터 수집 확인**
4. **`/utils/analytics.ts` 구현사항 검토**

가장 효과적인 디버깅 방법은 **GTM Preview Mode**를 사용하는 것입니다!
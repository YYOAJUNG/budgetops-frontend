# BudgetOps Frontend

React + TypeScript + Vite 기반의 BudgetOps 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구 및 개발 서버
- **Docker** - 컨테이너화
- **Nginx** - 프로덕션 웹 서버

## 개발 환경 설정

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint
```

### Docker로 실행

#### 프로덕션 빌드
```bash
# Docker 이미지 빌드 및 실행
docker-compose -f docker/docker-compose.yml up --build

# 백그라운드 실행
docker-compose -f docker/docker-compose.yml up -d --build
```

#### 개발 환경
```bash
# 개발 서버로 실행 (핫 리로드 지원)
docker-compose -f docker/docker-compose.yml --profile dev up --build
```

## 프로젝트 구조

```
budgetops-fe/
├── config/           # 개발 도구 설정 파일들
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── .eslintrc.cjs
├── docker/           # Docker 관련 파일들
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── .dockerignore
├── src/              # 소스 코드
│   ├── components/   # 재사용 가능한 컴포넌트
│   ├── pages/        # 페이지 컴포넌트
│   ├── styles/       # 스타일 파일
│   └── utils/        # 유틸리티 함수
├── package.json      # 프로젝트 설정
├── index.html        # 메인 HTML 파일
├── .gitignore        # Git 무시 파일 목록
└── README.md         # 프로젝트 문서
```

## API 연동

백엔드 API는 `/api/` 경로로 프록시됩니다. `docker/nginx.conf`에서 백엔드 서버 주소를 설정할 수 있습니다.

## 환경 변수

`.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=BudgetOps
```

## 배포

프로덕션 배포를 위해서는 `docker-compose -f docker/docker-compose.yml up --build` 명령어를 사용하세요. 애플리케이션은 포트 3000에서 실행됩니다.

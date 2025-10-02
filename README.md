# budgetops-fe

React + TypeScript + Vite 기반 프론트엔드. Docker로 실행 가능합니다.

## 로컬 개발

```
npm run dev
```

## 프로덕션 빌드

```
npm run build
npm run preview
```

## Docker

이미지 빌드:

```
docker build -f docker/Dockerfile -t budgetops-fe:dev .
```

컨테이너 실행:

```
docker run --rm -p 5173:5173 budgetops-fe:dev
```

접속: `http://localhost:5173`

빈 페이지가 렌더링됩니다.

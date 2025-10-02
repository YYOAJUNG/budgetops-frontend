# Multi-stage build: build Vite app then serve with Nginx

# 1) Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./ 2>/dev/null || true
RUN npm ci --no-audit --no-fund || npm i --no-audit --no-fund
COPY . .
RUN npm run build

# 2) Runtime - Nginx static server
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]



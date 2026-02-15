# ── Stage 1: Build frontend ──
FROM node:20-alpine AS frontend-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile || pnpm install
WORKDIR /app/packages/web
COPY packages/web/ .
RUN pnpm build

# ── Stage 2: Build API ──
FROM node:20-alpine AS api-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/api/package.json packages/api/
RUN pnpm install --frozen-lockfile || pnpm install
WORKDIR /app/packages/api
COPY packages/api/ .
RUN pnpm build

# ── Stage 3: Production ──
FROM node:20-alpine AS production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate
RUN apk add --no-cache wget

COPY pnpm-workspace.yaml package.json ./
COPY packages/api/package.json packages/api/
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy built API
COPY --from=api-build /app/packages/api/dist ./packages/api/dist
COPY --from=api-build /app/packages/api/migrations ./packages/api/migrations

# Copy built frontend
COPY --from=frontend-build /app/packages/web/dist ./packages/web/dist

# Create data directory
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/app/data/todo.db
ENV STATIC_DIR=/app/packages/web/dist

EXPOSE 3000

CMD ["node", "packages/api/dist/server.js"]

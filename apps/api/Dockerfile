# CA Career OS — Production API Dockerfile (Multi-stage build)
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.14.0 --activate

# Copy root workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Build shared package, generate Prisma Client, and build API
RUN pnpm --filter @ca-career-os/shared build
RUN pnpm --filter @ca-career-os/api prisma:generate
RUN pnpm --filter @ca-career-os/api build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@12.14.0 --activate

# Create non-root system user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

# Copy root manifests and production node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

USER nestjs

EXPOSE 4000
ENV PORT=4000

CMD ["node", "apps/api/dist/main.js"]

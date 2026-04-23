# Stage 1: Builder
FROM node:20-slim AS builder

WORKDIR /app

# Install build tools (Debian 기반)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace config
COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all dependencies
RUN yarn workspace @sagonnani/api install --frozen-lockfile

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Generate Prisma client
RUN yarn workspace @sagonnani/api prisma generate

# Build NestJS app
RUN yarn workspace @sagonnani/api build

# ---

# Stage 2: Production image
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl dumb-init \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Copy workspace config
COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Copy source (for Prisma schema)
COPY packages/shared/ ./packages/shared/
COPY apps/api/prisma/ ./apps/api/prisma/

# Install production dependencies only
RUN yarn workspace @sagonnani/api install --frozen-lockfile --production && \
    yarn cache clean

# Copy built output and generated Prisma client
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/apps/api

EXPOSE 3000

COPY apps/api/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["dumb-init", "--"]
CMD ["/docker-entrypoint.sh"]

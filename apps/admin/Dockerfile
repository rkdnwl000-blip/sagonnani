# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/admin/package.json ./apps/admin/

COPY packages/shared/ ./packages/shared/
COPY apps/admin/ ./apps/admin/

RUN yarn workspace @sagonnani/admin install --frozen-lockfile

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN yarn workspace @sagonnani/admin build

# ---

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app/apps/admin

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./.next/static
COPY --from=builder /app/apps/admin/public ./public

EXPOSE 3000

CMD ["node", "server.js"]

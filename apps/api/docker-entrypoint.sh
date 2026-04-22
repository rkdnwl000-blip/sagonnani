#!/bin/sh
set -e

echo "▶ Running Prisma migrations..."
npx prisma migrate deploy --schema=/app/apps/api/prisma/schema.prisma

echo "▶ Starting API server..."
exec node /app/apps/api/dist/main.js

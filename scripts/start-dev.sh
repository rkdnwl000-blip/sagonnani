#!/bin/bash

# ============================================
# 사고났니? - 로컬 개발 환경 일괄 실행 스크립트
# 사용법: ./scripts/start-dev.sh
# ============================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

log() { echo -e "${CYAN}[sagonnani]${RESET} $1"; }
success() { echo -e "${GREEN}✅ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠️  $1${RESET}"; }
error() { echo -e "${RED}❌ $1${RESET}"; }

# 로컬 IP 자동 감지 및 .env.local 업데이트
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
if [ -n "$LOCAL_IP" ]; then
  echo "EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:3000/api/v1" > "$ROOT_DIR/apps/mobile/.env.device"
  echo "EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:3000/api/v1" > "$ROOT_DIR/apps/mobile-company/.env.device"
fi

echo -e ""
echo -e "${BOLD}🚗 사고났니? 개발 서버 시작${RESET}"
echo -e "================================"
echo -e ""

# ----------------------------------------
# 1. PostgreSQL 확인
# ----------------------------------------
log "PostgreSQL 상태 확인..."
if pg_isready -q 2>/dev/null; then
  success "PostgreSQL 실행 중"
else
  warn "PostgreSQL이 실행되지 않았습니다. 시작 중..."
  brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null || {
    error "PostgreSQL 시작 실패. 수동으로 실행해주세요."
    exit 1
  }
  sleep 2
  success "PostgreSQL 시작됨"
fi

# ----------------------------------------
# 2. MinIO (로컬 S3) 확인 / 시작
# ----------------------------------------
log "MinIO 상태 확인..."
if curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; then
  success "MinIO 실행 중 (http://localhost:9000)"
else
  warn "MinIO가 실행되지 않았습니다. 시작 중..."

  MINIO_ROOT_USER=sagonnani \
  MINIO_ROOT_PASSWORD=sagonnani123 \
  minio server "$ROOT_DIR/.minio-data" \
    --address ":9000" \
    --console-address ":9001" \
    > /tmp/minio.log 2>&1 &

  sleep 3

  if curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    success "MinIO 시작됨 (http://localhost:9000, Console: http://localhost:9001)"

    # 버킷 생성 (없으면)
    log "S3 버킷 확인/생성..."
    cd "$ROOT_DIR" && node scripts/setup-aws.mjs > /dev/null 2>&1 || true
  else
    error "MinIO 시작 실패. /tmp/minio.log 확인해주세요."
    exit 1
  fi
fi

# ----------------------------------------
# 3. shared 패키지 빌드
# ----------------------------------------
log "shared 패키지 빌드 확인..."
if [ -f "$ROOT_DIR/packages/shared/dist/index.js" ]; then
  success "shared 패키지 빌드됨"
else
  warn "shared 패키지 빌드 중..."
  cd "$ROOT_DIR/packages/shared" && npx tsc
  success "shared 패키지 빌드 완료"
fi

# ----------------------------------------
# 4. API 서버 빌드 & 실행
# ----------------------------------------
log "API 서버 시작..."

# 이미 실행 중인지 확인
if lsof -ti:3000 > /dev/null 2>&1; then
  warn "포트 3000이 이미 사용 중입니다. 기존 프로세스를 종료합니다..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

cd "$ROOT_DIR/apps/api"
npx nest build > /tmp/api-build.log 2>&1 &
BUILD_PID=$!
log "API 빌드 중..."
wait $BUILD_PID

if [ $? -ne 0 ]; then
  error "API 빌드 실패. /tmp/api-build.log 확인해주세요."
  cat /tmp/api-build.log | tail -20
  exit 1
fi

node dist/src/main.js > /tmp/api.log 2>&1 &
API_PID=$!

# API 시작 대기
log "API 서버 시작 대기 중..."
for i in {1..15}; do
  sleep 1
  if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    success "API 서버 시작됨 (http://localhost:3000)"
    break
  fi
  if [ $i -eq 15 ]; then
    # health 엔드포인트 없어도 포트만 열리면 OK
    if lsof -ti:3000 > /dev/null 2>&1; then
      success "API 서버 시작됨 (http://localhost:3000)"
    else
      error "API 서버 시작 실패. /tmp/api.log 확인해주세요."
      tail -30 /tmp/api.log
      exit 1
    fi
  fi
done

# ----------------------------------------
# 5. Admin 웹앱 (Next.js)
# ----------------------------------------
log "Admin 웹앱 시작..."

if lsof -ti:3001 > /dev/null 2>&1; then
  warn "포트 3001이 이미 사용 중입니다. 기존 프로세스를 종료합니다..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

cd "$ROOT_DIR/apps/admin"
PORT=3001 npx next dev > /tmp/admin.log 2>&1 &
ADMIN_PID=$!

# Admin 시작 대기
for i in {1..20}; do
  sleep 1
  if curl -sf http://localhost:3001 > /dev/null 2>&1; then
    success "Admin 웹앱 시작됨 (http://localhost:3001)"
    break
  fi
  if [ $i -eq 20 ]; then
    warn "Admin 웹앱 시작 확인 실패 (백그라운드에서 계속 시도 중). /tmp/admin.log 확인해주세요."
  fi
done

# ----------------------------------------
# 6. 모바일 앱 안내
# ----------------------------------------
echo -e ""
echo -e "${BOLD}📱 모바일 앱 실행 (별도 터미널에서):${RESET}"
echo -e ""
echo -e "  ${YELLOW}[시뮬레이터 / Expo Go - 로컬]${RESET}"
echo -e "    고객 앱:  cd $ROOT_DIR/apps/mobile && npx expo start"
echo -e "    업체 앱:  cd $ROOT_DIR/apps/mobile-company && npx expo start --port 8082"
echo -e ""
if [ -n "$LOCAL_IP" ]; then
  echo -e "  ${YELLOW}[실기기 테스트 - 같은 Wi-Fi 연결 필요]${RESET}"
  echo -e "    고객 앱:  cd $ROOT_DIR/apps/mobile && cp .env.device .env.local && npx expo start --tunnel"
  echo -e "    업체 앱:  cd $ROOT_DIR/apps/mobile-company && cp .env.device .env.local && npx expo start --tunnel --port 8082"
  echo -e "    현재 IP:  ${CYAN}${LOCAL_IP}${RESET}"
  echo -e ""
fi

# ----------------------------------------
# 완료 요약
# ----------------------------------------
echo -e "${BOLD}================================${RESET}"
echo -e "${GREEN}${BOLD}🎉 서비스 시작 완료!${RESET}"
echo -e "${BOLD}================================${RESET}"
echo -e ""
echo -e "  ${CYAN}API 서버:${RESET}     http://localhost:3000"
echo -e "  ${CYAN}Admin 웹앱:${RESET}   http://localhost:3001"
echo -e "  ${CYAN}MinIO Console:${RESET} http://localhost:9001"
echo -e "  ${CYAN}MinIO (S3):${RESET}   http://localhost:9000"
echo -e ""
echo -e "  ${YELLOW}로그 파일:${RESET}"
echo -e "    API:   /tmp/api.log"
echo -e "    Admin: /tmp/admin.log"
echo -e "    MinIO: /tmp/minio.log"
echo -e ""
echo -e "  ${YELLOW}테스트 계정:${RESET}"
echo -e "    고객:  010-1234-5678 / test1234"
echo -e "    업체:  010-9876-5432 / test1234"
echo -e "    관리자: 010-0000-0000 / admin1234"
echo -e ""
echo -e "  종료: ${RED}Ctrl+C${RESET} 또는 ${RED}./scripts/stop-dev.sh${RESET}"
echo -e ""

# ----------------------------------------
# 종료 시 프로세스 정리
# ----------------------------------------
cleanup() {
  echo -e ""
  log "서비스 종료 중..."
  kill $API_PID $ADMIN_PID 2>/dev/null || true
  success "종료 완료"
}
trap cleanup EXIT INT TERM

# 대기 (Ctrl+C까지)
wait

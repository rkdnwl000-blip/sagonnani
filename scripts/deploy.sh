#!/bin/bash
# ================================================
# 사고났니? EC2 배포 스크립트
# 사용법: ./scripts/deploy.sh [--first-time]
# ================================================

set -e

REPO_URL="https://github.com/YOUR_GITHUB_ID/sagonnani.git"
APP_DIR="/home/ubuntu/sagonnani"
COMPOSE_FILE="docker-compose.prod.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] $1${NC}"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] $1${NC}"; exit 1; }

# ── 최초 서버 세팅 (--first-time 플래그 사용 시) ──
if [ "$1" = "--first-time" ]; then
  log "EC2 초기 세팅 시작..."

  # Docker 설치
  if ! command -v docker &> /dev/null; then
    log "Docker 설치 중..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker ubuntu
    sudo systemctl enable docker
    sudo systemctl start docker
  fi

  # Docker Compose v2 설치
  if ! docker compose version &> /dev/null; then
    log "Docker Compose 설치 중..."
    sudo apt-get update -y
    sudo apt-get install -y docker-compose-plugin
  fi

  # 프로젝트 클론
  if [ ! -d "$APP_DIR" ]; then
    log "프로젝트 클론 중..."
    git clone "$REPO_URL" "$APP_DIR"
  fi

  log "환경변수 파일을 .env.production 에 생성해주세요:"
  echo "  cp $APP_DIR/.env.production.example $APP_DIR/.env.production"
  echo "  nano $APP_DIR/.env.production"
  echo ""
  warn "환경변수 설정 후 다시 ./scripts/deploy.sh 를 실행하세요."
  exit 0
fi

# ── 일반 배포 ──────────────────────────────────
log "배포 시작..."

cd "$APP_DIR"

# 환경변수 파일 확인
if [ ! -f ".env.production" ]; then
  err ".env.production 파일이 없습니다. .env.production.example 을 복사하여 설정해주세요."
fi

# 최신 코드 가져오기
log "최신 코드 pull 중..."
git pull origin main

# 이미지 빌드
log "Docker 이미지 빌드 중..."
docker compose -f "$COMPOSE_FILE" --env-file .env.production build --no-cache

# 서비스 재시작 (무중단)
log "서비스 재시작 중..."
docker compose -f "$COMPOSE_FILE" --env-file .env.production up -d --remove-orphans

# 사용하지 않는 이미지 정리
log "미사용 이미지 정리 중..."
docker image prune -f

# MinIO 버킷 생성 (최초 1회)
log "MinIO 버킷 설정 중..."
sleep 5
docker compose -f "$COMPOSE_FILE" exec -T minio \
  mc alias set local http://localhost:9000 \
  "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" exec -T minio \
  mc mb --ignore-existing local/sagonnani-photos 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" exec -T minio \
  mc anonymous set download local/sagonnani-photos 2>/dev/null || true

log "배포 완료!"
echo ""
echo "  API:   http://$(curl -s ifconfig.me):3000/api/v1"
echo "  Admin: http://$(curl -s ifconfig.me):3001"
echo "  MinIO: http://$(curl -s ifconfig.me):9001"
echo ""

# 컨테이너 상태 확인
docker compose -f "$COMPOSE_FILE" ps

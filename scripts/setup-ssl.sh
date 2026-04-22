#!/bin/bash
# ================================================
# Let's Encrypt SSL 인증서 발급 스크립트
# 사용법: ./scripts/setup-ssl.sh api.sagonnani.com admin.sagonnani.com
# 전제조건:
#   - 도메인 DNS가 이 서버 IP를 가리키고 있어야 함
#   - 포트 80이 열려 있어야 함
# ================================================

set -e

DOMAINS=("$@")

if [ ${#DOMAINS[@]} -eq 0 ]; then
  echo "사용법: $0 도메인1 [도메인2 ...]"
  echo "예시:  $0 api.sagonnani.com admin.sagonnani.com"
  exit 1
fi

GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}[SSL] $1${NC}"; }

# certbot 설치
if ! command -v certbot &> /dev/null; then
  log "Certbot 설치 중..."
  sudo apt-get update -y
  sudo apt-get install -y certbot
fi

# nginx 컨테이너 임시 중단 (80 포트 확보)
log "nginx 임시 중단..."
docker compose -f ~/sagonnani/docker-compose.prod.yml stop nginx 2>/dev/null || true

# 각 도메인 인증서 발급
for DOMAIN in "${DOMAINS[@]}"; do
  log "$DOMAIN 인증서 발급 중..."
  sudo certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email admin@sagonnani.com \
    -d "$DOMAIN"
done

# SSL 디렉터리 생성 및 인증서 복사
log "인증서 복사 중..."
mkdir -p ~/sagonnani/nginx/ssl

# 첫 번째 도메인 인증서를 기본으로 사용
PRIMARY_DOMAIN="${DOMAINS[0]}"
sudo cp /etc/letsencrypt/live/$PRIMARY_DOMAIN/fullchain.pem ~/sagonnani/nginx/ssl/
sudo cp /etc/letsencrypt/live/$PRIMARY_DOMAIN/privkey.pem ~/sagonnani/nginx/ssl/
sudo chown ubuntu:ubuntu ~/sagonnani/nginx/ssl/*.pem

# nginx.conf HTTPS 설정 활성화 안내
log "nginx.conf에서 HTTPS 블록 주석을 해제하고 nginx를 재시작하세요:"
echo ""
echo "  1. nano ~/sagonnani/nginx/nginx.conf"
echo "  2. HTTP → HTTPS redirect 주석 해제"
echo "  3. HTTPS server 블록 주석 해제"
echo "  4. docker compose -f docker-compose.prod.yml restart nginx"
echo ""

# nginx 재시작
log "nginx 재시작..."
cd ~/sagonnani
docker compose -f docker-compose.prod.yml start nginx

# 자동 갱신 크론 등록
log "인증서 자동 갱신 크론 등록..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$PRIMARY_DOMAIN/fullchain.pem ~/sagonnani/nginx/ssl/ && cp /etc/letsencrypt/live/$PRIMARY_DOMAIN/privkey.pem ~/sagonnani/nginx/ssl/ && docker compose -f ~/sagonnani/docker-compose.prod.yml restart nginx") | crontab -

log "SSL 설정 완료! 인증서는 90일마다 자동 갱신됩니다."

#!/bin/bash

# 사고났니? - 로컬 개발 환경 종료 스크립트

CYAN="\033[0;36m"
GREEN="\033[0;32m"
RESET="\033[0m"

echo -e "${CYAN}[sagonnani]${RESET} 서비스 종료 중..."

# 포트별 프로세스 종료
for PORT in 3000 3001 8081 8082 9000 9001; do
  PID=$(lsof -ti:$PORT 2>/dev/null)
  if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null && echo -e "  포트 $PORT 종료됨"
  fi
done

echo -e "${GREEN}✅ 종료 완료${RESET}"

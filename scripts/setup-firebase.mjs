/**
 * Firebase 설정 가이드 스크립트
 * 실행: node scripts/setup-firebase.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(`
🔥 Firebase 설정 가이드
========================

1. Firebase 콘솔 접속: https://console.firebase.google.com

2. 새 프로젝트 생성 (또는 기존 프로젝트 선택)
   프로젝트 이름: sagonnani

3. Android 앱 등록
   - 패키지 이름: com.sagonnani.customer  (고객 앱)
   - 패키지 이름: com.sagonnani.company   (업체 앱)
   - google-services.json 다운로드 → apps/mobile/google-services.json
   - google-services.json 다운로드 → apps/mobile-company/google-services.json

4. iOS 앱 등록
   - Bundle ID: com.sagonnani.customer
   - Bundle ID: com.sagonnani.company
   - GoogleService-Info.plist 다운로드 → 각 앱 루트에 배치

5. 서비스 계정 키 생성 (서버에서 알림 발송용)
   - Firebase 콘솔 → 프로젝트 설정 → 서비스 계정
   - "새 비공개 키 생성" 클릭
   - JSON 파일 내용을 아래 형식으로 .env에 추가:

   FIREBASE_SERVICE_ACCOUNT='{ ... JSON 내용 전체 ... }'

6. 설정 완료 후 API 서버 재시작:
   cd apps/api && node dist/src/main.js

========================
`);

// .env 파일 확인
const envPath = resolve(__dirname, '../apps/api/.env');
const envContent = readFileSync(envPath, 'utf-8');

if (envContent.includes('FIREBASE_SERVICE_ACCOUNT=')) {
  console.log('✅ FIREBASE_SERVICE_ACCOUNT 가 이미 설정되어 있습니다.');
} else {
  console.log('⚠️  FIREBASE_SERVICE_ACCOUNT 가 .env 에 없습니다. 위 가이드를 따라 설정해주세요.');
}

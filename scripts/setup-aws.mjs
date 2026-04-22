/**
 * AWS S3 버킷 자동 설정 스크립트
 * 실행: node scripts/setup-aws.mjs
 */
import { S3Client, CreateBucketCommand, PutBucketCorsCommand, PutBucketPolicyCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env 파일에서 환경변수 로드
const envPath = resolve(__dirname, '../apps/api/.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim().replace(/^"|"$/g, '')]; })
);

const REGION = env.AWS_REGION || 'ap-northeast-2';
const BUCKET = env.AWS_S3_BUCKET || 'sagonnani-photos';
const ACCESS_KEY = env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = env.AWS_SECRET_ACCESS_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('❌ AWS 자격증명이 없습니다.');
  console.error('   apps/api/.env 파일에 다음을 입력해주세요:');
  console.error('   AWS_ACCESS_KEY_ID=your-access-key');
  console.error('   AWS_SECRET_ACCESS_KEY=your-secret-key');
  process.exit(1);
}

const s3 = new S3Client({
  region: REGION,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

async function setup() {
  console.log(`\n🚀 AWS S3 버킷 설정 시작`);
  console.log(`   버킷: ${BUCKET}`);
  console.log(`   리전: ${REGION}\n`);

  // 1. 버킷 존재 여부 확인
  let bucketExists = false;
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
    bucketExists = true;
    console.log('✅ 버킷이 이미 존재합니다.');
  } catch {
    bucketExists = false;
  }

  // 2. 버킷 생성
  if (!bucketExists) {
    try {
      await s3.send(new CreateBucketCommand({
        Bucket: BUCKET,
        ...(REGION !== 'us-east-1' ? {
          CreateBucketConfiguration: { LocationConstraint: REGION }
        } : {}),
      }));
      console.log('✅ 버킷 생성 완료');
    } catch (e) {
      console.error('❌ 버킷 생성 실패:', e.message);
      process.exit(1);
    }
  }

  // 3. CORS 설정 (모바일 앱에서 직접 S3에 업로드하기 위해 필요)
  try {
    await s3.send(new PutBucketCorsCommand({
      Bucket: BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }));
    console.log('✅ CORS 설정 완료');
  } catch (e) {
    console.error('❌ CORS 설정 실패:', e.message);
  }

  // 4. 버킷 정책 - 퍼블릭 읽기 허용 (차량 사진 조회용)
  try {
    await s3.send(new PutBucketPolicyCommand({
      Bucket: BUCKET,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${BUCKET}/*`,
          },
        ],
      }),
    }));
    console.log('✅ 퍼블릭 읽기 정책 설정 완료');
  } catch (e) {
    console.error('⚠️  버킷 정책 설정 실패 (퍼블릭 액세스 차단이 켜져 있을 수 있습니다):', e.message);
    console.log('   → AWS 콘솔에서 "퍼블릭 액세스 차단" 해제 후 다시 실행하세요.');
  }

  console.log(`\n🎉 S3 설정 완료!`);
  console.log(`   버킷 URL: https://${BUCKET}.s3.${REGION}.amazonaws.com`);
  console.log(`   이제 차량 사진 업로드 기능이 활성화됩니다.\n`);
}

setup();

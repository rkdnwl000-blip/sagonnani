import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 중...');

  // 관리자 계정
  const adminPw = await bcrypt.hash('admin1234', 10);
  await prisma.user.upsert({
    where: { phone: '010-0000-0000' },
    update: {},
    create: {
      phone: '010-0000-0000',
      name: '관리자',
      email: 'admin@sagonnani.com',
      password: adminPw,
      role: 'ADMIN',
    },
  });

  // 테스트 고객
  const userPw = await bcrypt.hash('test1234', 10);
  await prisma.user.upsert({
    where: { phone: '010-1234-5678' },
    update: {},
    create: {
      phone: '010-1234-5678',
      name: '홍길동',
      password: userPw,
    },
  });

  // 테스트 업체
  const companyPw = await bcrypt.hash('test1234', 10);
  const company = await prisma.company.upsert({
    where: { businessNumber: '123-45-67890' },
    update: {},
    create: {
      businessName: '(주)빠른대차',
      businessNumber: '123-45-67890',
      ownerName: '김사장',
      phone: '010-9876-5432',
      address: '서울시 강남구 테헤란로 123',
      password: companyPw,
      status: 'ACTIVE',
      commissionBalance: 500000,
    },
  });

  // 테스트 차량
  await prisma.vehicle.createMany({
    data: [
      { companyId: company.id, name: '현대 아반떼', plateNumber: '11가 1111', year: 2023, category: 'UNDER_2000CC', dailyRate: 50000 },
      { companyId: company.id, name: '기아 K5', plateNumber: '22나 2222', year: 2022, category: 'CC_2000_3000', dailyRate: 80000 },
      { companyId: company.id, name: '제네시스 G80', plateNumber: '33다 3333', year: 2023, category: 'CC_3000_4000', dailyRate: 150000 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ 시드 완료!');
  console.log('');
  console.log('테스트 계정:');
  console.log('  고객: 010-1234-5678 / test1234');
  console.log('  업체: 010-9876-5432 / test1234');
  console.log('  관리자: 010-0000-0000 / admin1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());

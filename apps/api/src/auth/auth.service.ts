import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto, LoginDto, RegisterCompanyDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ===== 고객 회원가입 =====
  async registerUser(dto: RegisterUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (exists) throw new ConflictException('이미 등록된 전화번호입니다.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, phone: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = this.signToken(user.id, 'CUSTOMER', 'user');
    return { user, token };
  }

  // ===== 고객 로그인 =====
  async loginUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('전화번호 또는 비밀번호가 올바르지 않습니다.');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('전화번호 또는 비밀번호가 올바르지 않습니다.');

    if (user.status !== 'ACTIVE') throw new UnauthorizedException('계정이 비활성화 상태입니다.');

    const { password, ...safeUser } = user;
    const token = this.signToken(user.id, user.role, 'user');
    return { user: safeUser, token };
  }

  // ===== 업체 회원가입 =====
  async registerCompany(dto: RegisterCompanyDto) {
    const exists = await this.prisma.company.findUnique({ where: { phone: dto.phone } });
    if (exists) throw new ConflictException('이미 등록된 전화번호입니다.');

    const existsBiz = await this.prisma.company.findUnique({ where: { businessNumber: dto.businessNumber } });
    if (existsBiz) throw new ConflictException('이미 등록된 사업자등록번호입니다.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const company = await this.prisma.company.create({
      data: { ...dto, password: hashed },
      select: { id: true, businessName: true, ownerName: true, phone: true, status: true, createdAt: true },
    });

    return { company, message: '회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다.' };
  }

  // ===== 업체 로그인 =====
  async loginCompany(dto: LoginDto) {
    const company = await this.prisma.company.findUnique({ where: { phone: dto.phone } });
    if (!company) throw new UnauthorizedException('전화번호 또는 비밀번호가 올바르지 않습니다.');

    const valid = await bcrypt.compare(dto.password, company.password);
    if (!valid) throw new UnauthorizedException('전화번호 또는 비밀번호가 올바르지 않습니다.');

    if (company.status === 'SUSPENDED') throw new UnauthorizedException('계정이 정지 상태입니다.');

    const { password, ...safeCompany } = company;
    const token = this.signToken(company.id, 'COMPANY', 'company');
    return { company: safeCompany, token };
  }

  // ===== FCM 토큰 업데이트 =====
  async updateUserFcmToken(userId: string, fcmToken: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { fcmToken } });
  }

  async updateCompanyFcmToken(companyId: string, fcmToken: string) {
    await this.prisma.company.update({ where: { id: companyId }, data: { fcmToken } });
  }

  private signToken(id: string, role: string, type: 'user' | 'company') {
    return this.jwtService.sign({ sub: id, role, type });
  }
}

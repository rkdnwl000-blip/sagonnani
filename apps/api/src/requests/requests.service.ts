import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRequestDto } from './dto/request.dto';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ===== 대차 요청 생성 (고객) =====
  async create(userId: string, dto: CreateRequestDto) {
    const request = await this.prisma.rentalRequest.create({
      data: {
        userId,
        ...dto,
        accidentDate: new Date(dto.accidentDate),
        desiredPickupAt: dto.desiredPickupAt ? new Date(dto.desiredPickupAt) : undefined,
        status: 'MATCHING',
      },
      include: { user: { select: { name: true, phone: true } } },
    });

    // 해당 카테고리 차량을 보유한 업체들에게 푸시 알림 발송
    await this.notifyMatchingCompanies(request.id, dto.vehicleCategory);

    return request;
  }

  // ===== 내 요청 목록 조회 (고객) =====
  async findMyRequests(userId: string) {
    return this.prisma.rentalRequest.findMany({
      where: { userId },
      include: {
        quotes: {
          include: {
            company: { select: { businessName: true, rating: true, phone: true } },
            vehicle: true,
          },
          where: { status: { not: 'EXPIRED' } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ===== 요청 상세 조회 =====
  async findOne(id: string, actorId: string, actorType: string) {
    const request = await this.prisma.rentalRequest.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true } },
        quotes: {
          include: {
            company: { select: { businessName: true, rating: true, phone: true, address: true } },
            vehicle: true,
          },
        },
        vehiclePhotos: true,
      },
    });

    if (!request) throw new NotFoundException('요청을 찾을 수 없습니다.');

    if (actorType === 'user' && request.userId !== actorId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return request;
  }

  // ===== 대차 요청 취소 (고객) =====
  async cancel(id: string, userId: string) {
    const request = await this.prisma.rentalRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('요청을 찾을 수 없습니다.');
    if (request.userId !== userId) throw new ForbiddenException('접근 권한이 없습니다.');
    if (['RETURNED', 'CANCELLED'].includes(request.status)) {
      throw new ForbiddenException('이미 완료되거나 취소된 요청입니다.');
    }

    return this.prisma.rentalRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  // ===== 업체: 신규 대차 요청 목록 조회 =====
  async findForCompany(companyId: string, category?: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { vehicles: { where: { isAvailable: true } } },
    });

    const availableCategories = [...new Set(company.vehicles.map((v) => v.category))];

    return this.prisma.rentalRequest.findMany({
      where: {
        status: 'MATCHING',
        vehicleCategory: category
          ? { equals: category as any }
          : { in: availableCategories as any },
        quotes: { none: { companyId } }, // 이미 견적 보낸 건 제외
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ===== 반납 완료 처리 =====
  async markReturned(id: string, userId: string) {
    const request = await this.prisma.rentalRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('요청을 찾을 수 없습니다.');
    if (request.userId !== userId) throw new ForbiddenException();
    if (request.status !== 'IN_USE') throw new ForbiddenException('이용 중인 대차가 아닙니다.');

    return this.prisma.rentalRequest.update({
      where: { id },
      data: { status: 'RETURNED' },
    });
  }

  private async notifyMatchingCompanies(requestId: string, category: string) {
    const companies = await this.prisma.company.findMany({
      where: {
        status: 'ACTIVE',
        vehicles: {
          some: { category: category as any, isAvailable: true },
        },
        fcmToken: { not: null },
      },
      select: { fcmToken: true },
    });

    const tokens = companies.map((c) => c.fcmToken).filter(Boolean);
    if (tokens.length > 0) {
      await this.notifications.sendMulticast(tokens, {
        title: '새 대차 요청이 도착했습니다!',
        body: `${category} 등급 차량 요청입니다. 빠르게 견적을 보내세요.`,
        data: { type: 'NEW_REQUEST', requestId },
      });
    }
  }
}

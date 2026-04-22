import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateQuoteDto } from './dto/quote.dto';
import { QUOTE_EXPIRY_MINUTES, COMMISSION_MIN } from '@sagonnani/shared';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ===== 견적 제출 (업체) =====
  async create(companyId: string, requestId: string, dto: CreateQuoteDto) {
    const request = await this.prisma.rentalRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('요청을 찾을 수 없습니다.');
    if (request.status !== 'MATCHING') throw new BadRequestException('이미 종료된 요청입니다.');

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
    if (!vehicle || vehicle.companyId !== companyId) throw new ForbiddenException('해당 차량이 없습니다.');

    // 중복 견적 방지
    const existing = await this.prisma.quote.findFirst({ where: { requestId, companyId } });
    if (existing) throw new BadRequestException('이미 견적을 제출하셨습니다.');

    const expiresAt = new Date(Date.now() + QUOTE_EXPIRY_MINUTES * 60 * 1000);
    const quote = await this.prisma.quote.create({
      data: { requestId, companyId, vehicleId: dto.vehicleId, dailyRate: dto.dailyRate, message: dto.message, expiresAt },
      include: {
        company: { select: { businessName: true, rating: true, phone: true } },
        vehicle: true,
      },
    });

    // 고객에게 견적 알림
    const user = await this.prisma.user.findUnique({ where: { id: request.userId } });
    if (user?.fcmToken) {
      await this.notifications.send(user.fcmToken, {
        title: '새 견적이 도착했습니다!',
        body: `${quote.company.businessName}에서 견적을 보냈습니다.`,
        data: { type: 'NEW_QUOTE', requestId, quoteId: quote.id },
      });
    }

    return quote;
  }

  // ===== 견적 수락 (고객) =====
  async accept(quoteId: string, userId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { request: true, company: true },
    });
    if (!quote) throw new NotFoundException('견적을 찾을 수 없습니다.');
    if (quote.request.userId !== userId) throw new ForbiddenException();
    if (quote.status !== 'PENDING') throw new BadRequestException('수락할 수 없는 견적입니다.');
    if (new Date() > quote.expiresAt) throw new BadRequestException('만료된 견적입니다.');

    // 업체 잔액 확인 및 수수료 차감
    if (quote.company.commissionBalance < COMMISSION_MIN) {
      throw new BadRequestException('업체의 잔액이 부족합니다.');
    }

    await this.prisma.$transaction([
      // 견적 수락
      this.prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'ACCEPTED', confirmedAt: new Date() },
      }),
      // 나머지 견적 거절
      this.prisma.quote.updateMany({
        where: { requestId: quote.requestId, id: { not: quoteId } },
        data: { status: 'REJECTED' },
      }),
      // 요청 상태 변경
      this.prisma.rentalRequest.update({
        where: { id: quote.requestId },
        data: { status: 'CONFIRMED' },
      }),
      // 수수료 차감
      this.prisma.company.update({
        where: { id: quote.companyId },
        data: { commissionBalance: { decrement: COMMISSION_MIN } },
      }),
      // 거래 내역 기록
      this.prisma.commissionTransaction.create({
        data: {
          companyId: quote.companyId,
          amount: -COMMISSION_MIN,
          type: 'DEDUCT',
          requestId: quote.requestId,
        },
      }),
    ]);

    // 업체에 알림
    if (quote.company.fcmToken) {
      await this.notifications.send(quote.company.fcmToken, {
        title: '견적이 수락되었습니다!',
        body: '고객이 견적을 수락했습니다. 배차를 준비하세요.',
        data: { type: 'QUOTE_ACCEPTED', requestId: quote.requestId, quoteId },
      });
    }

    return { message: '견적이 수락되었습니다.' };
  }

  // ===== 차량 인도 확인 → IN_USE 상태 변경 (업체) =====
  async confirmDelivery(requestId: string, companyId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { requestId, companyId, status: 'ACCEPTED' },
      include: { request: true },
    });
    if (!quote) throw new NotFoundException('확정된 견적이 없습니다.');

    return this.prisma.rentalRequest.update({
      where: { id: requestId },
      data: { status: 'IN_USE' },
    });
  }
}

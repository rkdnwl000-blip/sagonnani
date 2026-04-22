import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly tossSecretKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.tossSecretKey = this.config.get('TOSS_SECRET_KEY') || '';
  }

  // ===== 결제 준비: 주문 ID 생성 =====
  async prepare(companyId: string, amount: number) {
    const orderId = `sagonnani-${companyId.slice(-6)}-${Date.now()}`;

    // 결제 대기 기록 저장
    await this.prisma.commissionTransaction.create({
      data: {
        companyId,
        amount,
        type: 'CHARGE',
        orderId,
        status: 'PENDING',
      },
    });

    return {
      orderId,
      amount,
      orderName: `사고났니? 수수료 충전 ${amount.toLocaleString()}원`,
      customerName: '업체',
    };
  }

  // ===== 결제 승인: 토스페이먼츠 서버 검증 =====
  async confirm(companyId: string, paymentKey: string, orderId: string, amount: number) {
    // 1. DB에서 주문 조회
    const tx = await this.prisma.commissionTransaction.findFirst({
      where: { orderId, companyId, status: 'PENDING' },
    });
    if (!tx) throw new BadRequestException('유효하지 않은 주문입니다.');
    if (tx.amount !== amount) throw new BadRequestException('금액이 일치하지 않습니다.');

    // 2. 토스페이먼츠 결제 승인 API 호출
    const encoded = Buffer.from(`${this.tossSecretKey}:`).toString('base64');
    try {
      await axios.post(
        'https://api.tosspayments.com/v1/payments/confirm',
        { paymentKey, orderId, amount },
        { headers: { Authorization: `Basic ${encoded}`, 'Content-Type': 'application/json' } },
      );
    } catch (e) {
      this.logger.error('토스페이먼츠 승인 실패:', e.response?.data);
      await this.prisma.commissionTransaction.update({
        where: { id: tx.id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException(e.response?.data?.message || '결제 승인에 실패했습니다.');
    }

    // 3. 잔액 충전 + 거래 상태 업데이트
    await this.prisma.$transaction([
      this.prisma.company.update({
        where: { id: companyId },
        data: { commissionBalance: { increment: amount } },
      }),
      this.prisma.commissionTransaction.update({
        where: { id: tx.id },
        data: { status: 'SUCCESS', paymentKey },
      }),
    ]);

    return { message: '충전 완료', amount };
  }

  // ===== 환불 (관리자용) =====
  async refund(companyId: string, orderId: string, reason: string) {
    const tx = await this.prisma.commissionTransaction.findFirst({
      where: { orderId, companyId, status: 'SUCCESS' },
    });
    if (!tx) throw new BadRequestException('환불 가능한 거래가 없습니다.');

    const encoded = Buffer.from(`${this.tossSecretKey}:`).toString('base64');
    await axios.post(
      `https://api.tosspayments.com/v1/payments/${tx.paymentKey}/cancel`,
      { cancelReason: reason },
      { headers: { Authorization: `Basic ${encoded}`, 'Content-Type': 'application/json' } },
    );

    await this.prisma.$transaction([
      this.prisma.company.update({
        where: { id: companyId },
        data: { commissionBalance: { decrement: tx.amount } },
      }),
      this.prisma.commissionTransaction.create({
        data: {
          companyId,
          amount: -tx.amount,
          type: 'REFUND',
          orderId: `refund-${orderId}`,
          status: 'SUCCESS',
        },
      }),
    ]);

    return { message: '환불 완료' };
  }
}

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { PreparePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('prepare')
  @ApiOperation({ summary: '결제 준비 (주문 ID 발급)' })
  prepare(@Request() req: any, @Body() dto: PreparePaymentDto) {
    if (req.user.type !== 'company') throw new Error('업체만 이용 가능합니다.');
    return this.paymentsService.prepare(req.user.sub, dto.amount);
  }

  @Post('confirm')
  @ApiOperation({ summary: '결제 승인 (토스페이먼츠 검증 후 잔액 충전)' })
  confirm(@Request() req: any, @Body() dto: ConfirmPaymentDto) {
    if (req.user.type !== 'company') throw new Error('업체만 이용 가능합니다.');
    return this.paymentsService.confirm(req.user.sub, dto.paymentKey, dto.orderId, dto.amount);
  }
}

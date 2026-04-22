import { Controller, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/quote.dto';

@ApiTags('견적')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Post('requests/:requestId/quotes')
  @ApiOperation({ summary: '견적 제출 (업체)' })
  create(
    @Param('requestId') requestId: string,
    @Request() req,
    @Body() dto: CreateQuoteDto,
  ) {
    return this.quotesService.create(req.user.id, requestId, dto);
  }

  @Patch('quotes/:quoteId/accept')
  @ApiOperation({ summary: '견적 수락 (고객)' })
  accept(@Param('quoteId') quoteId: string, @Request() req) {
    return this.quotesService.accept(quoteId, req.user.id);
  }

  @Patch('requests/:requestId/delivery')
  @ApiOperation({ summary: '차량 인도 확인 - 이용중 상태 변경 (업체)' })
  confirmDelivery(@Param('requestId') requestId: string, @Request() req) {
    return this.quotesService.confirmDelivery(requestId, req.user.id);
  }
}

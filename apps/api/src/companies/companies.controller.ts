import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompaniesService } from './companies.service';

@ApiTags('업체')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('me')
  @ApiOperation({ summary: '내 업체 프로필 (업체)' })
  getProfile(@Request() req) {
    return this.companiesService.getProfile(req.user.id);
  }

  @Get('me/transactions')
  @ApiOperation({ summary: '수수료 거래 내역 (업체)' })
  getTransactions(@Request() req) {
    return this.companiesService.getTransactions(req.user.id);
  }

  @Get('me/quotes')
  @ApiOperation({ summary: '내가 보낸 견적 목록 (업체)' })
  getMyQuotes(@Request() req) {
    return this.companiesService.getMyQuotes(req.user.id);
  }
}

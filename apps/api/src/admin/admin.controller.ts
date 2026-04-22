import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';

class ChargeDto {
  @ApiProperty({ example: 100000 })
  @IsInt()
  @Min(1000)
  amount: number;
}

@ApiTags('관리자')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '대시보드 통계' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('companies')
  @ApiOperation({ summary: '업체 목록' })
  @ApiQuery({ name: 'status', required: false })
  getCompanies(@Query('status') status?: string) {
    return this.adminService.getCompanies(status);
  }

  @Patch('companies/:id/approve')
  @ApiOperation({ summary: '업체 승인' })
  approveCompany(@Param('id') id: string) {
    return this.adminService.approveCompany(id);
  }

  @Patch('companies/:id/suspend')
  @ApiOperation({ summary: '업체 정지' })
  suspendCompany(@Param('id') id: string) {
    return this.adminService.suspendCompany(id);
  }

  @Post('companies/:id/charge')
  @ApiOperation({ summary: '업체 수수료 잔액 충전' })
  chargeCommission(@Param('id') id: string, @Body() dto: ChargeDto) {
    return this.adminService.chargeCommission(id, dto.amount);
  }

  @Get('requests')
  @ApiOperation({ summary: '대차 요청 목록' })
  @ApiQuery({ name: 'status', required: false })
  getRequests(@Query('status') status?: string) {
    return this.adminService.getRequests(status);
  }
}

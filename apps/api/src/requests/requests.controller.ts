import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/request.dto';

@ApiTags('대차 요청')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: '대차 요청 생성 (고객)' })
  create(@Request() req, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: '내 대차 요청 목록 (고객)' })
  findMy(@Request() req) {
    return this.requestsService.findMyRequests(req.user.id);
  }

  @Get('available')
  @ApiOperation({ summary: '신규 대차 요청 목록 (업체)' })
  @ApiQuery({ name: 'category', required: false, description: '차량 카테고리 필터' })
  findForCompany(@Request() req, @Query('category') category?: string) {
    return this.requestsService.findForCompany(req.user.id, category);
  }

  @Get(':id')
  @ApiOperation({ summary: '대차 요청 상세' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.requestsService.findOne(id, req.user.id, req.user.type);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '대차 요청 취소 (고객)' })
  cancel(@Param('id') id: string, @Request() req) {
    return this.requestsService.cancel(id, req.user.id);
  }

  @Patch(':id/returned')
  @ApiOperation({ summary: '반납 완료 (고객)' })
  markReturned(@Param('id') id: string, @Request() req) {
    return this.requestsService.markReturned(id, req.user.id);
  }
}

import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VehiclesService, CreateVehicleDto, UpdateVehicleDto } from './vehicles.service';

@ApiTags('차량 관리')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: '차량 등록 (업체)' })
  create(@Request() req, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: '내 차량 목록 (업체)' })
  findMy(@Request() req) {
    return this.vehiclesService.findByCompany(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '차량 정보 수정 (업체)' })
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '차량 삭제 (업체)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.vehiclesService.remove(id, req.user.id);
  }
}

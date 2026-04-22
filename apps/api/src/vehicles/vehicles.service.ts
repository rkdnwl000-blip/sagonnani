import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IsString, IsEnum, IsInt, IsBoolean, IsOptional, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

export class CreateVehicleDto {
  @ApiProperty({ example: '현대 아반떼' })
  @IsString()
  name: string;

  @ApiProperty({ example: '12가 3456' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  year: number;

  @ApiProperty({ enum: ['UNDER_2000CC', 'CC_2000_3000', 'CC_3000_4000', 'OVER_4000CC_OR_EV'] })
  @IsString()
  category: string;

  @ApiProperty({ example: 50000, description: '일일 대차 비용' })
  @IsInt()
  @Min(0)
  dailyRate: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  photos?: string[];
}

export class UpdateVehicleDto {
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsInt()
  @IsOptional()
  dailyRate?: number;
}

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: { ...dto, companyId, category: dto.category as any },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.vehicle.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, companyId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException();
    if (vehicle.companyId !== companyId) throw new ForbiddenException();
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async remove(id: string, companyId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException();
    if (vehicle.companyId !== companyId) throw new ForbiddenException();
    return this.prisma.vehicle.delete({ where: { id } });
  }
}

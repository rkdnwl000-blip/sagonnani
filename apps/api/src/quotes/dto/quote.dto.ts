import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty({ example: 'vehicle-uuid', description: '배차할 차량 ID' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 50000, description: '일일 대차 비용 (원)' })
  @IsInt()
  @Min(0)
  dailyRate: number;

  @ApiPropertyOptional({ example: '보험 처리 완료 후 즉시 배차 가능합니다.' })
  @IsString()
  @IsOptional()
  message?: string;
}

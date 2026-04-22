import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AccidentType {
  REAR_END = 'REAR_END',
  SIDE_COLLISION = 'SIDE_COLLISION',
  FRONT_COLLISION = 'FRONT_COLLISION',
  SINGLE = 'SINGLE',
  OTHER = 'OTHER',
}

export enum VehicleCategory {
  UNDER_2000CC = 'UNDER_2000CC',
  CC_2000_3000 = 'CC_2000_3000',
  CC_3000_4000 = 'CC_3000_4000',
  OVER_4000CC_OR_EV = 'OVER_4000CC_OR_EV',
}

export class CreateRequestDto {
  @ApiProperty({ enum: AccidentType, description: '사고 유형' })
  @IsEnum(AccidentType)
  accidentType: AccidentType;

  @ApiProperty({ example: '2025-12-01T10:00:00Z', description: '사고 일시' })
  @IsDateString()
  accidentDate: string;

  @ApiProperty({ example: '서울시 강남구 테헤란로 123 앞', description: '사고 장소' })
  @IsString()
  accidentLocation: string;

  @ApiProperty({ enum: VehicleCategory, description: '원하는 대차 차량 등급' })
  @IsEnum(VehicleCategory)
  vehicleCategory: VehicleCategory;

  @ApiProperty({ example: '현대 아반떼', description: '내 사고 차량 모델' })
  @IsString()
  myVehicleModel: string;

  @ApiProperty({ example: '12가 3456', description: '내 사고 차량 번호' })
  @IsString()
  myVehiclePlate: string;

  @ApiPropertyOptional({ example: '삼성화재', description: '보험사' })
  @IsString()
  @IsOptional()
  insuranceCompany?: string;

  @ApiPropertyOptional({ example: '2025-12-01-1234', description: '사고 접수 번호' })
  @IsString()
  @IsOptional()
  insuranceNumber?: string;

  @ApiPropertyOptional({ example: '2025-12-02T09:00:00Z', description: '원하는 배차 일시' })
  @IsDateString()
  @IsOptional()
  desiredPickupAt?: string;

  @ApiPropertyOptional({ example: '가능하면 SUV로 부탁드립니다.' })
  @IsString()
  @IsOptional()
  memo?: string;
}

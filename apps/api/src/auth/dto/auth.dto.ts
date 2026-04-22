import { IsString, IsPhoneNumber, MinLength, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: '010-1234-5678', description: '휴대폰 번호' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '홍길동', description: '이름' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (6자 이상)' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RegisterCompanyDto {
  @ApiProperty({ example: '(주)빠른대차', description: '업체명' })
  @IsString()
  businessName: string;

  @ApiProperty({ example: '123-45-67890', description: '사업자등록번호' })
  @IsString()
  businessNumber: string;

  @ApiProperty({ example: '김사장', description: '대표자명' })
  @IsString()
  ownerName: string;

  @ApiProperty({ example: '010-9876-5432', description: '업체 전화번호' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'company@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '서울시 강남구 테헤란로 123', description: '업체 주소' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateFcmTokenDto {
  @ApiProperty({ example: 'fcm_token_here' })
  @IsString()
  fcmToken: string;
}

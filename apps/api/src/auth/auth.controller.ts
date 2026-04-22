import { Controller, Post, Body, UseGuards, Patch, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginDto, RegisterCompanyDto, UpdateFcmTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('user/register')
  @ApiOperation({ summary: '고객 회원가입' })
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('user/login')
  @ApiOperation({ summary: '고객 로그인' })
  loginUser(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }

  @Post('company/register')
  @ApiOperation({ summary: '렌터카 업체 회원가입' })
  registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.authService.registerCompany(dto);
  }

  @Post('company/login')
  @ApiOperation({ summary: '렌터카 업체 로그인' })
  loginCompany(@Body() dto: LoginDto) {
    return this.authService.loginCompany(dto);
  }

  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'FCM 토큰 업데이트 (푸시 알림용)' })
  async updateFcmToken(@Request() req, @Body() dto: UpdateFcmTokenDto) {
    if (req.user.type === 'user') {
      await this.authService.updateUserFcmToken(req.user.id, dto.fcmToken);
    } else {
      await this.authService.updateCompanyFcmToken(req.user.id, dto.fcmToken);
    }
    return { message: 'FCM 토큰이 업데이트되었습니다.' };
  }
}

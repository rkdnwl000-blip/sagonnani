import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PhotosService } from './photos.service';

class SavePhotoDto {
  @ApiProperty({ example: 'FRONT' })
  @IsString()
  angle: string;

  @ApiProperty({ example: 'PICKUP', description: 'PICKUP | RETURN' })
  @IsString()
  phase: string;

  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/...' })
  @IsString()
  url: string;
}

@ApiTags('차량 사진')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('requests/:requestId/photos')
export class PhotosController {
  constructor(private photosService: PhotosService) {}

  @Get('upload-url')
  @ApiOperation({ summary: 'S3 업로드용 Presigned URL 발급' })
  @ApiQuery({ name: 'angle', example: 'FRONT' })
  @ApiQuery({ name: 'phase', example: 'PICKUP' })
  getUploadUrl(
    @Param('requestId') requestId: string,
    @Query('angle') angle: string,
    @Query('phase') phase: string,
    @Request() req,
  ) {
    return this.photosService.getUploadUrl(requestId, angle, phase, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '사진 메타데이터 저장 (S3 업로드 완료 후)' })
  savePhoto(
    @Param('requestId') requestId: string,
    @Body() dto: SavePhotoDto,
    @Request() req,
  ) {
    return this.photosService.savePhotoRecord(requestId, dto.angle, dto.phase, dto.url, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '사진 목록 조회' })
  getPhotos(@Param('requestId') requestId: string, @Request() req) {
    return this.photosService.getPhotos(requestId, req.user.id);
  }
}

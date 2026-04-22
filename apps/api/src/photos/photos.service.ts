import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotosService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const endpoint = config.get('AWS_S3_ENDPOINT'); // 로컬 MinIO용
    this.s3 = new S3Client({
      region: config.get('AWS_REGION', 'ap-northeast-2'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
      },
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    });
    this.bucket = config.get('AWS_S3_BUCKET');
  }

  // ===== Presigned URL 발급 (프론트에서 직접 S3 업로드) =====
  async getUploadUrl(requestId: string, angle: string, phase: string, userId: string) {
    const request = await this.prisma.rentalRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new BadRequestException('요청을 찾을 수 없습니다.');
    if (request.userId !== userId) throw new ForbiddenException();

    const key = `vehicle-photos/${requestId}/${phase}/${angle}/${uuidv4()}.jpg`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: 'image/jpeg',
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 300 }); // 5분
    const endpoint = this.config.get('AWS_S3_ENDPOINT');
    const region = this.config.get('AWS_REGION', 'ap-northeast-2');
    const publicUrl = endpoint
      ? `${endpoint}/${this.bucket}/${key}`  // 로컬 MinIO
      : `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`; // AWS S3

    return { uploadUrl: url, publicUrl, key };
  }

  // ===== 사진 메타데이터 저장 (업로드 완료 후 호출) =====
  async savePhotoRecord(
    requestId: string,
    angle: string,
    phase: string,
    url: string,
    userId: string,
  ) {
    const request = await this.prisma.rentalRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new BadRequestException('요청을 찾을 수 없습니다.');
    if (request.userId !== userId) throw new ForbiddenException();

    return this.prisma.vehiclePhoto.create({
      data: {
        requestId,
        angle: angle as any,
        phase: phase as any,
        url,
      },
    });
  }

  // ===== 사진 목록 조회 =====
  async getPhotos(requestId: string, userId: string) {
    const request = await this.prisma.rentalRequest.findUnique({ where: { id: requestId } });
    if (!request || request.userId !== userId) throw new ForbiddenException();

    return this.prisma.vehiclePhoto.findMany({
      where: { requestId },
      orderBy: [{ phase: 'asc' }, { takenAt: 'asc' }],
    });
  }
}

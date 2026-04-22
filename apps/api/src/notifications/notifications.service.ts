import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private initialized = false;

  constructor(private config: ConfigService) {
    this.initFirebase();
  }

  private initFirebase() {
    const serviceAccount = this.config.get('FIREBASE_SERVICE_ACCOUNT');
    if (!serviceAccount) {
      this.logger.warn('Firebase 서비스 계정이 설정되지 않았습니다. 푸시 알림이 비활성화됩니다.');
      return;
    }
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccount)),
        });
      }
      this.initialized = true;
    } catch (e) {
      this.logger.error('Firebase 초기화 실패:', e);
    }
  }

  async send(token: string, payload: PushPayload): Promise<void> {
    if (!this.initialized) return;
    try {
      await admin.messaging().send({
        token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
    } catch (e) {
      this.logger.error(`푸시 발송 실패 (token: ${token.substring(0, 10)}...):`, e.message);
    }
  }

  async sendMulticast(tokens: string[], payload: PushPayload): Promise<void> {
    if (!this.initialized || tokens.length === 0) return;
    try {
      const result = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
      this.logger.log(`멀티캐스트 전송: 성공 ${result.successCount}, 실패 ${result.failureCount}`);
    } catch (e) {
      this.logger.error('멀티캐스트 푸시 발송 실패:', e.message);
    }
  }
}

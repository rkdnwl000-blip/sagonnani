import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

/**
 * 토스페이먼츠 WebView 리디렉션 서버
 *
 * 흐름:
 *   앱 → WebView(GET /payments/web/checkout) → 토스 위젯 → 토스 서버
 *     → GET /payments/web/success (or /fail) → 딥링크로 앱 복귀
 */
@ApiExcludeController()
@Controller('payments/web')
export class PaymentsWebController {
  constructor(private config: ConfigService) {}

  // ─── 1. 결제 체크아웃 페이지 ───────────────────────────────────────────
  @Get('checkout')
  checkout(
    @Query('orderId') orderId: string,
    @Query('amount') amount: string,
    @Query('orderName') orderName: string,
    @Query('customerName') customerName: string,
    @Query('scheme') scheme: string, // 'sagonnani' | 'sagonnani-company'
    @Res() res: Response,
  ) {
    const clientKey = this.config.get('TOSS_CLIENT_KEY') || '';
    const apiBase = this.config.get('API_BASE_URL') || 'https://api.sagonnani.com/api/v1';
    const successUrl = encodeURIComponent(`${apiBase}/payments/web/success?scheme=${scheme}`);
    const failUrl = encodeURIComponent(`${apiBase}/payments/web/fail?scheme=${scheme}`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>결제</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
           background: #f5f5f5; min-height: 100vh; }
    .header {
      background: #FFD600; padding: 16px 20px;
      display: flex; align-items: center; gap: 12px;
    }
    .header h1 { font-size: 17px; font-weight: 800; color: #1A1A1A; }
    .logo { font-size: 22px; }
    .amount-box {
      background: #1A1A1A; margin: 20px; border-radius: 16px;
      padding: 20px 24px; color: white;
    }
    .amount-label { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
    .amount-value { font-size: 28px; font-weight: 900; color: #FFD600; }
    .order-name { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 6px; }
    #payment-widget { margin: 0 20px; }
    .btn {
      display: block; width: calc(100% - 40px); margin: 20px auto;
      background: #FFD600; border: none; border-radius: 14px;
      padding: 16px; font-size: 16px; font-weight: 900;
      color: #1A1A1A; cursor: pointer; letter-spacing: -0.3px;
    }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .loading {
      display: flex; justify-content: center; align-items: center;
      height: 200px; font-size: 14px; color: #999;
    }
    .error-box {
      margin: 20px; padding: 16px; background: #fff0f0;
      border-radius: 12px; color: #cc0000; font-size: 14px; display: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">🚗</span>
    <h1>사고났니? 수수료 충전</h1>
  </div>

  <div class="amount-box">
    <div class="amount-label">충전 금액</div>
    <div class="amount-value">${Number(amount).toLocaleString('ko-KR')}원</div>
    <div class="order-name">${orderName || '수수료 잔액 충전'}</div>
  </div>

  <div id="payment-widget">
    <div class="loading">결제 수단을 불러오는 중...</div>
  </div>

  <div class="error-box" id="error-box"></div>

  <button class="btn" id="pay-btn" disabled>결제하기</button>

  <script src="https://js.tosspayments.com/v1/payment-widget"></script>
  <script>
    (async () => {
      const clientKey = '${clientKey}';
      const orderId   = '${orderId}';
      const amount    = ${Number(amount)};
      const orderName = '${orderName}';
      const customerName = '${customerName}';
      const successUrl = decodeURIComponent('${successUrl}') + '&orderId=' + orderId + '&amount=' + amount;
      const failUrl    = decodeURIComponent('${failUrl}');

      try {
        const paymentWidget = await PaymentWidget.init(clientKey, PaymentWidget.ANONYMOUS);

        await paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: amount },
          { variantKey: 'DEFAULT' }
        );

        const btn = document.getElementById('pay-btn');
        btn.disabled = false;

        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = '결제 처리 중...';
          try {
            await paymentWidget.requestPayment({
              orderId,
              orderName,
              customerName,
              successUrl,
              failUrl,
            });
          } catch (e) {
            const errBox = document.getElementById('error-box');
            errBox.style.display = 'block';
            errBox.textContent = e.message || '결제 중 오류가 발생했습니다.';
            btn.disabled = false;
            btn.textContent = '다시 시도하기';
          }
        });
      } catch (e) {
        document.getElementById('payment-widget').innerHTML =
          '<div class="loading" style="color:#cc0000">결제 모듈 로드 실패. 네트워크를 확인해주세요.</div>';
      }
    })();
  </script>
</body>
</html>`);
  }

  // ─── 2. 결제 성공 → 딥링크 리디렉션 ─────────────────────────────────────
  @Get('success')
  success(
    @Query('paymentKey') paymentKey: string,
    @Query('orderId') orderId: string,
    @Query('amount') amount: string,
    @Query('scheme') scheme: string,
    @Res() res: Response,
  ) {
    const deepLink = `${scheme}://payment/success?paymentKey=${encodeURIComponent(paymentKey)}&orderId=${encodeURIComponent(orderId)}&amount=${amount}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>결제 완료</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #f5f5f5;
           display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100vh; padding: 24px; }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 900; color: #1A1A1A; margin-bottom: 8px; }
    p  { font-size: 15px; color: #666; text-align: center; line-height: 1.5; }
    .amount { font-size: 28px; font-weight: 900; color: #1A1A1A;
              background: #FFD600; padding: 4px 16px; border-radius: 8px;
              margin: 16px 0; }
    .btn { margin-top: 32px; background: #FFD600; border: none;
           border-radius: 14px; padding: 14px 32px;
           font-size: 16px; font-weight: 900; cursor: pointer; color: #1A1A1A; }
  </style>
</head>
<body>
  <div class="icon">✅</div>
  <h1>결제 완료!</h1>
  <div class="amount">${Number(amount).toLocaleString('ko-KR')}원</div>
  <p>수수료 잔액이 충전되었습니다.<br />앱으로 돌아가는 중...</p>
  <button class="btn" onclick="goBack()">앱으로 돌아가기</button>

  <script>
    function goBack() {
      window.location.href = '${deepLink}';
    }
    // 자동 리디렉션 (1.2초 후)
    setTimeout(goBack, 1200);
  </script>
</body>
</html>`);
  }

  // ─── 3. 결제 실패/취소 → 딥링크 리디렉션 ────────────────────────────────
  @Get('fail')
  fail(
    @Query('code') code: string,
    @Query('message') message: string,
    @Query('orderId') orderId: string,
    @Query('scheme') scheme: string,
    @Res() res: Response,
  ) {
    const deepLink = `${scheme}://payment/fail?code=${encodeURIComponent(code || '')}&message=${encodeURIComponent(message || '')}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>결제 실패</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #f5f5f5;
           display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100vh; padding: 24px; }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 900; color: #1A1A1A; margin-bottom: 8px; }
    p  { font-size: 15px; color: #666; text-align: center; line-height: 1.5; }
    .err { font-size: 14px; color: #cc0000; background: #fff0f0;
           padding: 10px 16px; border-radius: 10px; margin-top: 12px;
           max-width: 300px; text-align: center; }
    .btn { margin-top: 32px; background: #1A1A1A; border: none;
           border-radius: 14px; padding: 14px 32px;
           font-size: 16px; font-weight: 900; cursor: pointer; color: #FFD600; }
  </style>
</head>
<body>
  <div class="icon">❌</div>
  <h1>결제가 취소되었습니다</h1>
  <p>결제가 완료되지 않았습니다.</p>
  ${message ? `<div class="err">${message}</div>` : ''}
  <button class="btn" onclick="goBack()">앱으로 돌아가기</button>

  <script>
    function goBack() {
      window.location.href = '${deepLink}';
    }
    setTimeout(goBack, 1500);
  </script>
</body>
</html>`);
  }
}

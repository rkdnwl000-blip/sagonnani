import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

const HTML_STYLE = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo',
                   'Noto Sans KR', sans-serif;
      background: #fff; color: #1A1A1A;
      max-width: 720px; margin: 0 auto; padding: 24px 20px 60px;
      line-height: 1.7; font-size: 15px;
    }
    header { background: #FFD600; margin: -24px -20px 32px; padding: 20px 24px; }
    header h1 { font-size: 20px; font-weight: 900; }
    header p  { font-size: 13px; color: #555; margin-top: 4px; }
    h2 { font-size: 17px; font-weight: 800; margin: 28px 0 10px;
         padding-bottom: 6px; border-bottom: 2px solid #FFD600; }
    h3 { font-size: 15px; font-weight: 700; margin: 18px 0 6px; }
    p, li { color: #333; margin-bottom: 8px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 4px; }
    .updated { font-size: 13px; color: #888; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
    th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }
    th { background: #f8f8f8; font-weight: 700; }
    a { color: #0066cc; }
  </style>
`;

@ApiExcludeController()
@Controller('legal')
export class LegalController {
  @Get('privacy')
  privacy(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>개인정보처리방침 — 사고났니?</title>
  ${HTML_STYLE}
</head>
<body>
  <header>
    <h1>🚗 사고났니?</h1>
    <p>개인정보처리방침</p>
  </header>

  <p class="updated">최종 업데이트: 2026년 4월 22일 | 시행일: 2026년 5월 1일</p>

  <p>
    <strong>사고났니?</strong>(이하 "회사")는 「개인정보 보호법」 및 관련 법령에 따라
    이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하게 처리하기 위해
    다음과 같이 개인정보처리방침을 수립·공개합니다.
  </p>

  <h2>1. 수집하는 개인정보의 항목 및 수집 방법</h2>
  <h3>① 고객(피해자) 앱</h3>
  <table>
    <tr><th>구분</th><th>수집 항목</th><th>수집 목적</th></tr>
    <tr><td>필수</td><td>이름, 휴대전화번호, 비밀번호</td><td>회원가입 및 본인 확인</td></tr>
    <tr><td>필수</td><td>사고 일시·장소, 차량 모델·번호판</td><td>대차 요청 처리</td></tr>
    <tr><td>선택</td><td>이메일, 보험사·사고접수번호</td><td>견적 및 보험 처리 지원</td></tr>
    <tr><td>자동수집</td><td>FCM 토큰, 접속 로그</td><td>푸시 알림 발송, 서비스 운영</td></tr>
    <tr><td>자동수집</td><td>차량 인수·반납 사진</td><td>분쟁 방지 증빙</td></tr>
  </table>

  <h3>② 렌터카 업체 앱</h3>
  <table>
    <tr><th>구분</th><th>수집 항목</th><th>수집 목적</th></tr>
    <tr><td>필수</td><td>상호명, 사업자등록번호, 대표자명, 연락처, 주소, 비밀번호</td><td>업체 가입 및 승인</td></tr>
    <tr><td>필수</td><td>보유 차량 정보(차량명, 번호판, 연식, 등급)</td><td>견적 제출 및 매칭</td></tr>
    <tr><td>자동수집</td><td>FCM 토큰, 결제 내역</td><td>알림 발송, 수수료 정산</td></tr>
  </table>

  <h2>2. 개인정보의 처리 목적</h2>
  <ul>
    <li>사고 대차 중개 서비스 제공 및 계약 이행</li>
    <li>회원 가입·관리 및 본인 확인</li>
    <li>견적 매칭 및 업체 관리</li>
    <li>수수료 결제 및 정산</li>
    <li>푸시 알림 발송 (신규 요청, 견적 수신 등)</li>
    <li>분쟁 조정을 위한 차량 사진 보관</li>
    <li>서비스 개선 및 통계 분석</li>
  </ul>

  <h2>3. 개인정보의 보유 및 이용 기간</h2>
  <table>
    <tr><th>항목</th><th>보유 기간</th><th>근거</th></tr>
    <tr><td>회원 정보</td><td>탈퇴 후 30일</td><td>서비스 이용 계약</td></tr>
    <tr><td>대차 요청·견적 기록</td><td>3년</td><td>전자상거래법</td></tr>
    <tr><td>결제·수수료 내역</td><td>5년</td><td>국세기본법</td></tr>
    <tr><td>차량 인수·반납 사진</td><td>분쟁 종결 후 1년</td><td>분쟁 조정 목적</td></tr>
    <tr><td>접속 로그</td><td>3개월</td><td>통신비밀보호법</td></tr>
  </table>

  <h2>4. 개인정보의 제3자 제공</h2>
  <p>
    회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다.
    단, 아래의 경우는 예외입니다.
  </p>
  <ul>
    <li>이용자가 사전에 동의한 경우</li>
    <li>법령에 따라 수사기관 등이 요구하는 경우</li>
    <li>견적 수락 시 고객 ↔ 업체 간 연락처 상호 공개 (서비스 특성상 필수)</li>
  </ul>

  <h2>5. 개인정보 처리 위탁</h2>
  <table>
    <tr><th>수탁업체</th><th>위탁 업무</th></tr>
    <tr><td>Amazon Web Services (AWS)</td><td>서버 및 파일 저장</td></tr>
    <tr><td>Google Firebase</td><td>푸시 알림 발송</td></tr>
    <tr><td>토스페이먼츠</td><td>결제 처리</td></tr>
  </table>

  <h2>6. 이용자의 권리</h2>
  <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
  <ul>
    <li>개인정보 열람·정정·삭제 요청</li>
    <li>개인정보 처리 정지 요청</li>
    <li>동의 철회 및 회원 탈퇴</li>
  </ul>
  <p>요청은 앱 내 '설정 → 회원 탈퇴' 또는 아래 고객센터로 연락해 주세요.</p>

  <h2>7. 개인정보 보호 조치</h2>
  <ul>
    <li>비밀번호 단방향 암호화 (bcrypt)</li>
    <li>HTTPS 전송 구간 암호화 (TLS 1.2 이상)</li>
    <li>JWT 토큰 기반 인증</li>
    <li>차량 사진 비공개 버킷 저장 (presigned URL 방식)</li>
  </ul>

  <h2>8. 개인정보 보호 책임자</h2>
  <table>
    <tr><th>항목</th><th>내용</th></tr>
    <tr><td>성명</td><td>이상혁</td></tr>
    <tr><td>이메일</td><td>privacy@sagonnani.com</td></tr>
    <tr><td>전화</td><td>고객센터 번호 기재 예정</td></tr>
  </table>

  <h2>9. 개인정보처리방침 변경</h2>
  <p>
    이 방침은 법령·서비스 변경에 따라 개정될 수 있으며,
    변경 시 앱 공지사항 및 이 페이지를 통해 사전 안내합니다.
  </p>
</body>
</html>`);
  }

  @Get('terms')
  terms(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>이용약관 — 사고났니?</title>
  ${HTML_STYLE}
</head>
<body>
  <header>
    <h1>🚗 사고났니?</h1>
    <p>서비스 이용약관</p>
  </header>

  <p class="updated">최종 업데이트: 2026년 4월 22일 | 시행일: 2026년 5월 1일</p>

  <h2>제1조 (목적)</h2>
  <p>
    이 약관은 <strong>사고났니?</strong>(이하 "회사")가 제공하는
    사고 대차 중개 플랫폼 서비스(이하 "서비스")의 이용 조건 및
    절차, 회사와 이용자의 권리·의무·책임 사항을 규정함을 목적으로 합니다.
  </p>

  <h2>제2조 (정의)</h2>
  <ul>
    <li><strong>서비스</strong>: 교통사고 피해자와 렌터카 업체를 연결하는 대차 중개 플랫폼</li>
    <li><strong>고객</strong>: 대차 서비스를 요청하는 교통사고 피해자</li>
    <li><strong>업체</strong>: 렌터카 차량을 제공하는 사업자</li>
    <li><strong>견적</strong>: 업체가 고객에게 제시하는 대차 조건 및 가격</li>
    <li><strong>수수료</strong>: 견적 수락 시 업체에 부과되는 중개 수수료</li>
  </ul>

  <h2>제3조 (약관의 효력 및 변경)</h2>
  <p>
    이 약관은 서비스 화면에 게시하거나 앱 공지를 통해 이용자에게 공지함으로써 효력이 발생합니다.
    회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 7일 전 공지 후 시행됩니다.
  </p>

  <h2>제4조 (서비스 이용 계약)</h2>
  <p>이용 계약은 이용자가 약관에 동의하고 회원가입을 완료함으로써 성립됩니다.</p>
  <ul>
    <li>고객: 만 14세 이상, 유효한 휴대전화번호 보유자</li>
    <li>업체: 유효한 사업자등록번호 보유, 관련 법령 준수 사업자</li>
  </ul>

  <h2>제5조 (서비스 내용)</h2>
  <ul>
    <li>고객의 대차 요청 등록 및 견적 수신</li>
    <li>업체의 견적 제출 및 매칭</li>
    <li>차량 인수·반납 사진 기록 (분쟁 방지)</li>
    <li>수수료 결제 및 정산</li>
  </ul>
  <p>
    <strong>회사는 중개 플랫폼으로서 직접 렌터카를 제공하지 않으며,
    고객과 업체 간 계약의 당사자가 아닙니다.</strong>
    대차 계약의 책임은 고객과 업체에 있습니다.
  </p>

  <h2>제6조 (수수료)</h2>
  <ul>
    <li>업체는 서비스 이용을 위해 사전에 수수료 잔액을 충전해야 합니다.</li>
    <li>고객이 업체의 견적을 수락하는 시점에 수수료(15,000원~)가 차감됩니다.</li>
    <li>이미 차감된 수수료는 환불되지 않습니다. 단, 회사 귀책 사유의 경우 예외입니다.</li>
  </ul>

  <h2>제7조 (이용자의 의무)</h2>
  <ul>
    <li>허위 정보 등록 금지</li>
    <li>타인의 정보를 도용하거나 부정 이용 금지</li>
    <li>서비스를 통한 불법 행위 금지</li>
    <li>플랫폼 외 직거래 유도 금지 (발각 시 서비스 이용 영구 정지)</li>
  </ul>

  <h2>제8조 (회사의 책임 제한)</h2>
  <ul>
    <li>천재지변 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
    <li>업체가 제공하는 차량 상태·품질에 대해 회사는 보증하지 않습니다.</li>
    <li>이용자 간 분쟁에 대해 회사는 조정을 지원하나 최종 책임을 지지 않습니다.</li>
  </ul>

  <h2>제9조 (서비스 해지)</h2>
  <p>이용자는 언제든지 앱 내 '설정 → 회원 탈퇴'를 통해 이용 계약을 해지할 수 있습니다.</p>
  <p>회사는 다음의 경우 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.</p>
  <ul>
    <li>허위 정보 등록 또는 타인 정보 도용</li>
    <li>서비스 내 불법·부정 행위</li>
    <li>플랫폼 외 직거래 유도</li>
  </ul>

  <h2>제10조 (분쟁 해결)</h2>
  <p>
    이 약관과 관련하여 분쟁이 발생할 경우, 회사 소재지를 관할하는
    법원을 합의 관할 법원으로 합니다.
    준거법은 대한민국 법령을 적용합니다.
  </p>

  <h2>제11조 (문의)</h2>
  <p>서비스 관련 문의: <a href="mailto:support@sagonnani.com">support@sagonnani.com</a></p>
</body>
</html>`);
  }
}

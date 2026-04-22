import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '사고났니? 관리자',
  description: '사고 대차 중개 플랫폼 관리자 대시보드',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

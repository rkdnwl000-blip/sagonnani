'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getToken } from '../../lib/api';

const NAV = [
  { href: '/dashboard', label: '대시보드', icon: '📊' },
  { href: '/dashboard/companies', label: '업체 관리', icon: '🏢' },
  { href: '/dashboard/requests', label: '대차 요청', icon: '🚗' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('admin_token');
    router.replace('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200 bg-yellow-400">
          <h1 className="text-xl font-black text-gray-900">사고났니?</h1>
          <p className="text-xs text-gray-600 mt-0.5">관리자 대시보드</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-yellow-50 text-gray-900 font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

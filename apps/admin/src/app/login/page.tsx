'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setToken } from '../../lib/api';

export default function LoginPage() {
  const [phone, setPhone] = useState('010-0000-0000');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.loginUser({ phone, password });
      if (res.user?.role !== 'ADMIN') {
        setError('관리자 계정이 아닙니다.');
        return;
      }
      setToken(res.token);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || '로그인 실패. 계정 정보를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-block bg-yellow-400 rounded-2xl px-6 py-4 mb-4">
            <h1 className="text-3xl font-black text-gray-900">사고났니?</h1>
          </div>
          <p className="text-gray-500 text-sm">관리자 대시보드</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">로그인</h2>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">전화번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            테스트 계정: 010-0000-0000 / admin1234
          </p>
        </form>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalRequests: number;
  activeRequests: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then((data) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">로딩 중...</div></div>;

  const cards = [
    { label: '총 고객 수', value: stats?.totalUsers?.toLocaleString(), icon: '👥', color: 'bg-blue-50 border-blue-200' },
    { label: '등록 업체', value: stats?.totalCompanies?.toLocaleString(), icon: '🏢', color: 'bg-green-50 border-green-200' },
    { label: '전체 요청', value: stats?.totalRequests?.toLocaleString(), icon: '📋', color: 'bg-purple-50 border-purple-200' },
    { label: '진행 중 요청', value: stats?.activeRequests?.toLocaleString(), icon: '🔄', color: 'bg-yellow-50 border-yellow-200' },
    { label: '총 수수료 수익', value: `${stats?.totalRevenue?.toLocaleString()}원`, icon: '💰', color: 'bg-red-50 border-red-200' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-6">대시보드</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} border rounded-xl p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-black text-gray-900">{card.value}</p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '../../../lib/api';
import { REQUEST_STATUS_LABELS } from '@sagonnani/shared';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-800',
  MATCHING: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-purple-100 text-purple-800',
  IN_USE: 'bg-green-100 text-green-800',
  RETURNED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getRequests(filter || undefined).then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900">대차 요청 관리</h2>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">전체</option>
          {Object.entries(REQUEST_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">로딩 중...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['고객', '차량', '사고 장소', '매칭 업체', '상태', '신청일'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => {
                const acceptedQuote = r.quotes?.find((q: any) => q.status === 'ACCEPTED');
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{r.user?.name}</div>
                      <div className="text-xs text-gray-400">{r.user?.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{r.myVehicleModel}</div>
                      <div className="text-xs text-gray-400">{r.myVehiclePlate}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.accidentLocation}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {acceptedQuote?.company?.businessName || <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[r.status]}`}>
                        {REQUEST_STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(r.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {requests.length === 0 && (
            <div className="text-center py-12 text-gray-400">요청이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '../../../lib/api';

const STATUS_LABELS: Record<string, string> = { PENDING: '승인 대기', ACTIVE: '정상', SUSPENDED: '정지' };
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [chargeAmount, setChargeAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    const data = await adminApi.getCompanies(filter || undefined);
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, [filter]);

  const handleApprove = async (id: string) => {
    await adminApi.approveCompany(id);
    fetchCompanies();
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('이 업체를 정지하시겠습니까?')) return;
    await adminApi.suspendCompany(id);
    fetchCompanies();
  };

  const handleCharge = async () => {
    if (!chargeId || !chargeAmount) return;
    await adminApi.chargeCommission(chargeId, parseInt(chargeAmount));
    setChargeId(null);
    setChargeAmount('');
    fetchCompanies();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900">업체 관리</h2>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">전체</option>
          <option value="PENDING">승인 대기</option>
          <option value="ACTIVE">정상</option>
          <option value="SUSPENDED">정지</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">로딩 중...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['업체명', '대표', '전화번호', '잔액', '평점', '상태', '액션'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.businessName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.ownerName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{c.commissionBalance?.toLocaleString()}원</td>
                  <td className="px-4 py-3">★ {c.rating?.toFixed(1) || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600"
                        >
                          승인
                        </button>
                      )}
                      {c.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => { setChargeId(c.id); setChargeAmount(''); }}
                            className="px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-lg hover:bg-yellow-500"
                          >
                            잔액 충전
                          </button>
                          <button
                            onClick={() => handleSuspend(c.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200"
                          >
                            정지
                          </button>
                        </>
                      )}
                      {c.status === 'SUSPENDED' && (
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200"
                        >
                          재활성화
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {companies.length === 0 && (
            <div className="text-center py-12 text-gray-400">업체가 없습니다.</div>
          )}
        </div>
      )}

      {/* 충전 모달 */}
      {chargeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80">
            <h3 className="text-lg font-black mb-4">수수료 잔액 충전</h3>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              placeholder="충전 금액 (원)"
              value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setChargeId(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleCharge}
                className="flex-1 py-2 bg-yellow-400 rounded-lg text-sm font-bold"
              >
                충전
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

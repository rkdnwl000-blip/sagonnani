import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { companyApi, requestsApi } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { VEHICLE_CATEGORY_LABELS } from '@sagonnani/shared';

const QUOTE_STATUS_LABELS: Record<string, string> = {
  PENDING: '응답 대기',
  ACCEPTED: '수락됨',
  REJECTED: '거절됨',
  EXPIRED: '만료됨',
};

const QUOTE_STATUS_COLORS: Record<string, string> = {
  PENDING: colors.warning,
  ACCEPTED: colors.success,
  REJECTED: colors.error,
  EXPIRED: colors.textMuted,
};

const REQUEST_STATUS_LABELS: Record<string, string> = {
  MATCHING: '매칭 중',
  CONFIRMED: '배차 확정',
  IN_USE: '이용 중',
  RETURNED: '반납 완료',
  CANCELLED: '취소됨',
};

export default function MyQuotesScreen() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      const res: any = await companyApi.getMyQuotes();
      setQuotes(res);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchQuotes(); }, []);

  const handleConfirmDelivery = (requestId: string) => {
    Alert.alert(
      '차량 인도 확인',
      '고객에게 차량을 인도하셨습니까?\n확인 시 "이용 중" 상태로 변경됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '인도 완료',
          onPress: async () => {
            setConfirming(requestId);
            try {
              await requestsApi.confirmDelivery(requestId);
              Alert.alert('완료', '차량 인도가 확인되었습니다.');
              fetchQuotes();
            } catch (e: any) {
              Alert.alert('오류', e.message);
            } finally {
              setConfirming(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const pendingCount = quotes.filter((q) => q.status === 'PENDING').length;
  const acceptedCount = quotes.filter((q) => q.status === 'ACCEPTED').length;

  return (
    <View style={styles.container}>
      {/* 요약 카드 */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: colors.warning }]}>
          <Text style={styles.summaryNum}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>응답 대기</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: colors.success }]}>
          <Text style={styles.summaryNum}>{acceptedCount}</Text>
          <Text style={styles.summaryLabel}>수락된 견적</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: colors.border }]}>
          <Text style={styles.summaryNum}>{quotes.length}</Text>
          <Text style={styles.summaryLabel}>전체</Text>
        </View>
      </View>

      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchQuotes(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>보낸 견적이 없습니다</Text>
            <Text style={styles.emptyDesc}>신규 요청 탭에서 견적을 보내보세요</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusColor = QUOTE_STATUS_COLORS[item.status] || colors.textMuted;
          const isConfirmed = item.request.status === 'CONFIRMED' && item.status === 'ACCEPTED';
          const isInUse = item.request.status === 'IN_USE' && item.status === 'ACCEPTED';

          return (
            <View style={[styles.card, item.status === 'ACCEPTED' && styles.cardAccepted]}>
              {/* 상단: 상태 뱃지 + 날짜 */}
              <View style={styles.cardTop}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {QUOTE_STATUS_LABELS[item.status]}
                  </Text>
                </View>
                <Text style={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                </Text>
              </View>

              {/* 요청 정보 */}
              <Text style={styles.requestTitle}>
                {item.request.myVehicleModel} ({item.request.myVehiclePlate})
              </Text>
              <Text style={styles.requestLocation}>📍 {item.request.accidentLocation}</Text>
              <Text style={styles.category}>
                {VEHICLE_CATEGORY_LABELS[item.request.vehicleCategory]?.split('(')[0].trim()}
              </Text>

              {/* 내 견적 내용 */}
              <View style={styles.quoteDivider} />
              <View style={styles.quoteRow}>
                <Text style={styles.quoteVehicle}>
                  {item.vehicle.name} ({item.vehicle.year}년)
                </Text>
                <Text style={styles.quotePrice}>일 {item.dailyRate.toLocaleString()}원</Text>
              </View>

              {/* 요청 현재 상태 표시 */}
              {item.status === 'ACCEPTED' && (
                <View style={styles.requestStatusRow}>
                  <Text style={styles.requestStatusLabel}>요청 상태: </Text>
                  <Text style={[styles.requestStatusValue, {
                    color: item.request.status === 'IN_USE' ? colors.success : colors.info,
                  }]}>
                    {REQUEST_STATUS_LABELS[item.request.status] || item.request.status}
                  </Text>
                </View>
              )}

              {/* 차량 인도 확인 버튼 (CONFIRMED 상태일 때만) */}
              {isConfirmed && (
                <TouchableOpacity
                  style={styles.deliveryBtn}
                  onPress={() => handleConfirmDelivery(item.request.id)}
                  disabled={confirming === item.request.id}
                >
                  {confirming === item.request.id ? (
                    <ActivityIndicator color={colors.text} />
                  ) : (
                    <Text style={styles.deliveryBtnText}>🚗 차량 인도 확인</Text>
                  )}
                </TouchableOpacity>
              )}

              {isInUse && (
                <View style={styles.inUseBadge}>
                  <Text style={styles.inUseBadgeText}>✓ 차량 이용 중</Text>
                </View>
              )}
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryRow: {
    flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8,
  },
  summaryCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1.5,
  },
  summaryNum: { fontSize: 22, fontWeight: '900', color: colors.text },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  card: {
    backgroundColor: colors.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardAccepted: { borderWidth: 1.5, borderColor: colors.success + '60' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardDate: { fontSize: 12, color: colors.textMuted },
  requestTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  requestLocation: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  category: {
    fontSize: 11, color: colors.textMuted,
    backgroundColor: colors.backgroundGray,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, alignSelf: 'flex-start', marginTop: 6,
  },
  quoteDivider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quoteVehicle: { fontSize: 13, color: colors.textSecondary },
  quotePrice: { fontSize: 16, fontWeight: '800', color: colors.text },
  requestStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  requestStatusLabel: { fontSize: 12, color: colors.textMuted },
  requestStatusValue: { fontSize: 12, fontWeight: '700' },
  deliveryBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    padding: 12, alignItems: 'center', marginTop: 12,
  },
  deliveryBtnText: { fontSize: 14, fontWeight: '700', color: colors.text },
  inUseBadge: {
    backgroundColor: colors.success + '15', borderRadius: 8,
    padding: 8, alignItems: 'center', marginTop: 10,
  },
  inUseBadgeText: { fontSize: 13, fontWeight: '700', color: colors.success },
});

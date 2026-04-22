import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { requestsApi } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { REQUEST_STATUS_LABELS } from '@sagonnani/shared';

const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.statusPending,
  MATCHING: colors.statusMatching,
  CONFIRMED: colors.statusConfirmed,
  IN_USE: colors.statusInUse,
  RETURNED: colors.statusReturned,
  CANCELLED: colors.statusCancelled,
};

export default function MyRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res: any = await requestsApi.getMy();
      setRequests(res);
    } catch (e) {
      // 빈 목록 유지
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchRequests(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={requests}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitle}>대차 요청 내역이 없습니다</Text>
          <Text style={styles.emptyDesc}>사고가 발생하면 즉시 대차를 신청해보세요</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/new-request')}>
            <Text style={styles.emptyBtnText}>대차 신청하기</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/request/${item.id}`)}>
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                {REQUEST_STATUS_LABELS[item.status] || item.status}
              </Text>
            </View>
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString('ko-KR')}
            </Text>
          </View>

          <Text style={styles.cardTitle}>{item.myVehicleModel} ({item.myVehiclePlate})</Text>
          <Text style={styles.cardSub}>{item.accidentLocation}</Text>

          {item.quotes?.length > 0 && (
            <View style={styles.quoteInfo}>
              <Text style={styles.quoteCount}>견적 {item.quotes.length}건 도착</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: 16, gap: 10 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
  emptyBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 24,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
  card: {
    backgroundColor: colors.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardDate: { fontSize: 12, color: colors.textMuted },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  quoteInfo: {
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  quoteCount: { fontSize: 13, fontWeight: '700', color: colors.primary },
});

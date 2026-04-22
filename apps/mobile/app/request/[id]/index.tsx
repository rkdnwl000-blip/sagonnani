import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { requestsApi, quotesApi } from '../../../src/services/api';
import { colors } from '../../../src/theme/colors';
import { REQUEST_STATUS_LABELS } from '@sagonnani/shared';

const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.statusPending,
  MATCHING: colors.statusMatching,
  CONFIRMED: colors.statusConfirmed,
  IN_USE: colors.statusInUse,
  RETURNED: colors.statusReturned,
  CANCELLED: colors.statusCancelled,
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    try {
      const res: any = await requestsApi.getOne(id);
      setRequest(res);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchRequest(); }, []);

  const handleAcceptQuote = (quoteId: string, companyName: string) => {
    Alert.alert(
      '견적 수락',
      `${companyName}의 견적을 수락하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '수락',
          onPress: async () => {
            setAccepting(quoteId);
            try {
              await quotesApi.accept(quoteId);
              Alert.alert('수락 완료!', '업체에 확정 알림을 전송했습니다.');
              fetchRequest();
            } catch (e: any) {
              Alert.alert('오류', e.message);
            } finally {
              setAccepting(null);
            }
          },
        },
      ],
    );
  };

  const handleMarkReturned = () => {
    Alert.alert('반납 완료', '차량을 반납하셨습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '반납 완료',
        onPress: async () => {
          await requestsApi.markReturned(id);
          fetchRequest();
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert(
      '요청 취소',
      '대차 요청을 취소하시겠습니까?',
      [
        { text: '돌아가기', style: 'cancel' },
        {
          text: '취소하기',
          style: 'destructive',
          onPress: async () => {
            try {
              await requestsApi.cancel(id);
              Alert.alert('취소 완료', '대차 요청이 취소되었습니다.', [
                { text: '확인', onPress: () => router.back() },
              ]);
            } catch (e: any) {
              Alert.alert('오류', e.message);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!request) {
    return <View style={styles.center}><Text>요청을 찾을 수 없습니다.</Text></View>;
  }

  const statusColor = STATUS_COLORS[request.status];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequest(); }} tintColor={colors.primary} />}
    >
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: statusColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {REQUEST_STATUS_LABELS[request.status]}
          </Text>
        </View>
      </View>

      {/* 요청 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>사고 정보</Text>
        <InfoRow label="차량" value={`${request.myVehicleModel} (${request.myVehiclePlate})`} />
        <InfoRow label="사고 장소" value={request.accidentLocation} />
        <InfoRow label="접수일" value={new Date(request.createdAt).toLocaleString('ko-KR')} />
        {request.insuranceCompany && <InfoRow label="보험사" value={request.insuranceCompany} />}
        {request.memo && <InfoRow label="메모" value={request.memo} />}
      </View>

      {/* 견적 목록 */}
      {request.quotes?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>받은 견적 ({request.quotes.length}건)</Text>
          {request.quotes.map((quote: any) => (
            <View key={quote.id} style={[styles.quoteCard, quote.status === 'ACCEPTED' && styles.quoteCardAccepted]}>
              <View style={styles.quoteHeader}>
                <Text style={styles.companyName}>{quote.company.businessName}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ {quote.company.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.vehicleName}>{quote.vehicle.name} ({quote.vehicle.year}년)</Text>
              <Text style={styles.price}>일 {quote.dailyRate.toLocaleString()}원</Text>
              {quote.message && <Text style={styles.quoteMsg}>{quote.message}</Text>}

              {quote.status === 'ACCEPTED' && (
                <View style={styles.acceptedBadge}>
                  <Text style={styles.acceptedText}>✓ 수락됨</Text>
                </View>
              )}

              {request.status === 'MATCHING' && quote.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptQuote(quote.id, quote.company.businessName)}
                  disabled={!!accepting}
                >
                  {accepting === quote.id ? (
                    <ActivityIndicator color={colors.text} />
                  ) : (
                    <Text style={styles.acceptBtnText}>이 견적 선택하기</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* 액션 버튼 */}
      {request.status === 'IN_USE' && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/request/${id}/photos`)}>
            <Text style={styles.actionBtnText}>📸 차량 반납 사진 촬영</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.returnBtn]} onPress={handleMarkReturned}>
            <Text style={styles.actionBtnText}>✅ 반납 완료 처리</Text>
          </TouchableOpacity>
        </View>
      )}

      {request.status === 'CONFIRMED' && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/request/${id}/photos`)}>
            <Text style={styles.actionBtnText}>📸 차량 인수 사진 촬영</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 취소 버튼 (MATCHING 상태에서만) */}
      {(request.status === 'MATCHING' || request.status === 'PENDING') && (
        <View style={[styles.section, { marginBottom: 32 }]}>
          <TouchableOpacity style={styles.cancelRequestBtn} onPress={handleCancel}>
            <Text style={styles.cancelRequestBtnText}>요청 취소</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.white, padding: 16, paddingTop: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 2,
  },
  backBtn: {},
  backText: { fontSize: 16, color: colors.text },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '700' },
  section: { margin: 16, backgroundColor: colors.white, borderRadius: 14, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 14 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  infoLabel: { width: 80, fontSize: 13, color: colors.textSecondary },
  infoValue: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '500' },
  quoteCard: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    padding: 14, marginBottom: 10,
  },
  quoteCardAccepted: { borderColor: colors.success, backgroundColor: colors.success + '08' },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  companyName: { fontSize: 15, fontWeight: '700', color: colors.text },
  ratingBadge: { backgroundColor: colors.primary + '40', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.text },
  vehicleName: { fontSize: 13, color: colors.textSecondary },
  price: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 6 },
  quoteMsg: { fontSize: 12, color: colors.textSecondary, marginTop: 6, fontStyle: 'italic' },
  acceptedBadge: { backgroundColor: colors.success + '20', padding: 8, borderRadius: 8, marginTop: 8, alignItems: 'center' },
  acceptedText: { fontSize: 13, fontWeight: '700', color: colors.success },
  acceptBtn: {
    backgroundColor: colors.primary, borderRadius: 10, padding: 12,
    alignItems: 'center', marginTop: 10,
  },
  acceptBtnText: { fontSize: 14, fontWeight: '700', color: colors.text },
  actionBtn: {
    backgroundColor: colors.primary, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 10,
  },
  returnBtn: { backgroundColor: colors.success + '30', borderWidth: 1.5, borderColor: colors.success },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
  cancelRequestBtn: {
    borderWidth: 1.5, borderColor: colors.statusCancelled,
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  cancelRequestBtnText: { fontSize: 15, fontWeight: '600', color: colors.statusCancelled },
});

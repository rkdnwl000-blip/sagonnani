import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useDispatch } from 'react-redux';
import { requestsApi, quotesApi, vehiclesApi } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { ACCIDENT_TYPE_LABELS, VEHICLE_CATEGORY_LABELS } from '@sagonnani/shared';
import { setRequestCount } from '../../src/store/requestBadgeSlice';
import { AppDispatch } from '../../src/store';

export default function RequestListScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [requests, setRequests] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quoteForm, setQuoteForm] = useState({ vehicleId: '', dailyRate: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [reqs, vehs]: any[] = await Promise.all([requestsApi.getAvailable(), vehiclesApi.getMy()]);
      setRequests(reqs);
      setVehicles(vehs.filter((v: any) => v.isAvailable));
      dispatch(setRequestCount(reqs.length));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  // 탭 포커스마다 새로고침 (새 요청 배지 업데이트)
  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

  const handleSubmitQuote = async () => {
    if (!quoteForm.vehicleId || !quoteForm.dailyRate) {
      Alert.alert('입력 오류', '차량과 가격을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await quotesApi.create(selectedRequest.id, {
        vehicleId: quoteForm.vehicleId,
        dailyRate: parseInt(quoteForm.dailyRate),
        message: quoteForm.message,
      });
      Alert.alert('견적 전송 완료!', '고객에게 견적을 보냈습니다.');
      setSelectedRequest(null);
      setQuoteForm({ vehicleId: '', dailyRate: '', message: '' });
      fetchAll();
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>새 요청이 없습니다</Text>
            <Text style={styles.emptyDesc}>새 대차 요청이 오면 알림을 보내드립니다</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedRequest(item)}>
            <View style={styles.cardTop}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{VEHICLE_CATEGORY_LABELS[item.vehicleCategory]?.split('(')[0].trim()}</Text>
              </View>
              <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <Text style={styles.vehicleInfo}>{item.myVehicleModel} ({item.myVehiclePlate})</Text>
            <Text style={styles.location}>📍 {item.accidentLocation}</Text>
            <Text style={styles.accidentType}>{ACCIDENT_TYPE_LABELS[item.accidentType]}</Text>
            <TouchableOpacity style={styles.quoteBtn} onPress={() => setSelectedRequest(item)}>
              <Text style={styles.quoteBtnText}>견적 보내기 →</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />

      {/* 견적 작성 모달 */}
      <Modal visible={!!selectedRequest} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>견적 작성</Text>
            {selectedRequest && (
              <Text style={styles.modalSub}>{selectedRequest.myVehicleModel} | {selectedRequest.accidentLocation}</Text>
            )}

            <Text style={styles.label}>배차 차량 선택 *</Text>
            {vehicles.length === 0 ? (
              <Text style={styles.noVehicle}>이용 가능한 차량이 없습니다</Text>
            ) : (
              vehicles.map((v: any) => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleOption, quoteForm.vehicleId === v.id && styles.vehicleOptionActive]}
                  onPress={() => setQuoteForm((f) => ({ ...f, vehicleId: v.id }))}
                >
                  <Text style={[styles.vehicleOptionText, quoteForm.vehicleId === v.id && styles.vehicleOptionTextActive]}>
                    {v.name} ({v.year}년) - {VEHICLE_CATEGORY_LABELS[v.category]?.split('(')[0].trim()}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            <Text style={styles.label}>일 대차 비용 (원) *</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 80000"
              value={quoteForm.dailyRate}
              onChangeText={(v) => setQuoteForm((f) => ({ ...f, dailyRate: v }))}
              keyboardType="numeric"
            />

            <Text style={styles.label}>메시지 (선택)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="고객에게 전달할 메시지"
              value={quoteForm.message}
              onChangeText={(v) => setQuoteForm((f) => ({ ...f, message: v }))}
              multiline numberOfLines={2}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedRequest(null)}>
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitQuote} disabled={submitting}>
                {submitting ? <ActivityIndicator color={colors.text} /> : <Text style={styles.submitBtnText}>견적 전송</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { backgroundColor: colors.primary + '30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { fontSize: 12, fontWeight: '700', color: colors.text },
  time: { fontSize: 12, color: colors.textMuted },
  vehicleInfo: { fontSize: 16, fontWeight: '700', color: colors.text },
  location: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  accidentType: { fontSize: 12, color: colors.warning, marginTop: 4, fontWeight: '600' },
  quoteBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12 },
  quoteBtnText: { fontSize: 14, fontWeight: '700', color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  modalSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 12 },
  noVehicle: { fontSize: 13, color: colors.error, padding: 10 },
  vehicleOption: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 6 },
  vehicleOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  vehicleOptionText: { fontSize: 13, color: colors.textSecondary },
  vehicleOptionTextActive: { color: colors.text, fontWeight: '700' },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: colors.backgroundGray },
  inputMulti: { height: 70, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: colors.textSecondary },
  submitBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
});

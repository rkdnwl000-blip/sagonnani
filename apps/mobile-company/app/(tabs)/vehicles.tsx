import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, TextInput, Switch, ActivityIndicator,
} from 'react-native';
import { vehiclesApi } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { VEHICLE_CATEGORY_LABELS } from '@sagonnani/shared';

const CATEGORIES = Object.entries(VEHICLE_CATEGORY_LABELS);

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', plateNumber: '', year: '', category: '', dailyRate: '' });
  const [saving, setSaving] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const res: any = await vehiclesApi.getMy();
      setVehicles(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.plateNumber || !form.year || !form.category || !form.dailyRate) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      await vehiclesApi.create({ ...form, year: parseInt(form.year), dailyRate: parseInt(form.dailyRate) });
      setShowAdd(false);
      setForm({ name: '', plateNumber: '', year: '', category: '', dailyRate: '' });
      fetchVehicles();
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (id: string, current: boolean) => {
    try {
      await vehiclesApi.update(id, { isAvailable: !current });
      fetchVehicles();
    } catch (e: any) {
      Alert.alert('오류', e.message);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addBtnText}>+ 차량 등록</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>등록된 차량이 없습니다.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.vehicleName}>{item.name}</Text>
                <Text style={styles.vehiclePlate}>{item.plateNumber} · {item.year}년</Text>
              </View>
              <Switch
                value={item.isAvailable}
                onValueChange={() => toggleAvailable(item.id, item.isAvailable)}
                trackColor={{ true: colors.success, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.category}>{VEHICLE_CATEGORY_LABELS[item.category]?.split('(')[0].trim()}</Text>
              <Text style={styles.price}>일 {item.dailyRate.toLocaleString()}원</Text>
            </View>
            <View style={[styles.availableDot, { backgroundColor: item.isAvailable ? colors.success : colors.border }]}>
              <Text style={styles.availableText}>{item.isAvailable ? '대차 가능' : '이용 불가'}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      />

      {/* 차량 등록 모달 */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>차량 등록</Text>

            {[
              { label: '차량명', key: 'name', placeholder: '예: 현대 아반떼', keyboard: 'default' },
              { label: '차량 번호', key: 'plateNumber', placeholder: '예: 12가 3456', keyboard: 'default' },
              { label: '연식', key: 'year', placeholder: '예: 2023', keyboard: 'numeric' },
              { label: '일 대차 비용 (원)', key: 'dailyRate', placeholder: '예: 80000', keyboard: 'numeric' },
            ].map((f) => (
              <View key={f.key}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                  keyboardType={f.keyboard as any}
                />
              </View>
            ))}

            <Text style={styles.label}>카테고리</Text>
            {CATEGORIES.map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.catOption, form.category === key && styles.catOptionActive]}
                onPress={() => setForm((f) => ({ ...f, category: key }))}
              >
                <Text style={[styles.catOptionText, form.category === key && styles.catOptionTextActive]}>
                  {label.split('(')[0].trim()}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.text} /> : <Text style={styles.submitBtnText}>등록</Text>}
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
  addBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  addBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  vehicleName: { fontSize: 16, fontWeight: '700', color: colors.text },
  vehiclePlate: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 12, color: colors.textMuted, backgroundColor: colors.backgroundGray, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  price: { fontSize: 15, fontWeight: '700', color: colors.text },
  availableDot: { marginTop: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  availableText: { fontSize: 12, fontWeight: '700', color: colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: colors.backgroundGray },
  catOption: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 10, marginBottom: 6 },
  catOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  catOptionText: { fontSize: 13, color: colors.textSecondary },
  catOptionTextActive: { color: colors.text, fontWeight: '700' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: colors.textSecondary },
  submitBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
});

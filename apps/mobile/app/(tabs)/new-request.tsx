import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { requestsApi } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { ACCIDENT_TYPE_LABELS, VEHICLE_CATEGORY_LABELS } from '@sagonnani/shared';

const ACCIDENT_TYPES = Object.entries(ACCIDENT_TYPE_LABELS);
const VEHICLE_CATEGORIES = Object.entries(VEHICLE_CATEGORY_LABELS);

export default function NewRequestScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    accidentType: '',
    accidentDate: new Date().toISOString(),
    accidentLocation: '',
    vehicleCategory: '',
    myVehicleModel: '',
    myVehiclePlate: '',
    insuranceCompany: '',
    insuranceNumber: '',
    memo: '',
  });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.accidentType || !form.accidentLocation || !form.vehicleCategory || !form.myVehicleModel || !form.myVehiclePlate) {
      Alert.alert('입력 오류', '필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res: any = await requestsApi.create(form);
      Alert.alert('신청 완료!', '업체들에게 요청이 전송되었습니다.\n견적이 도착하면 알림을 드릴게요.', [
        { text: '확인', onPress: () => router.push(`/request/${res.id}`) },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 진행 상태 */}
      <View style={styles.progressBar}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]}>
            <Text style={[styles.progressDotText, step >= s && styles.progressDotTextActive]}>{s}</Text>
          </View>
        ))}
        <View style={styles.progressLine} />
      </View>

      {/* STEP 1: 사고 정보 */}
      {step === 1 && (
        <View style={styles.section}>
          <Text style={styles.stepTitle}>사고 정보 입력</Text>

          <Text style={styles.label}>사고 유형 *</Text>
          <View style={styles.optionGrid}>
            {ACCIDENT_TYPES.map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.optionBtn, form.accidentType === key && styles.optionBtnActive]}
                onPress={() => update('accidentType', key)}
              >
                <Text style={[styles.optionBtnText, form.accidentType === key && styles.optionBtnTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>사고 장소 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 서울시 강남구 테헤란로 123 앞"
            value={form.accidentLocation}
            onChangeText={(v) => update('accidentLocation', v)}
            multiline
          />

          <TouchableOpacity
            style={[styles.nextBtn, (!form.accidentType || !form.accidentLocation) && styles.nextBtnDisabled]}
            onPress={() => setStep(2)}
            disabled={!form.accidentType || !form.accidentLocation}
          >
            <Text style={styles.nextBtnText}>다음 →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: 차량 정보 */}
      {step === 2 && (
        <View style={styles.section}>
          <Text style={styles.stepTitle}>차량 정보 입력</Text>

          <Text style={styles.label}>원하는 대차 등급 *</Text>
          {VEHICLE_CATEGORIES.map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.categoryBtn, form.vehicleCategory === key && styles.categoryBtnActive]}
              onPress={() => update('vehicleCategory', key)}
            >
              <Text style={[styles.categoryBtnText, form.vehicleCategory === key && styles.categoryBtnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>내 사고 차량 모델 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 현대 아반떼"
            value={form.myVehicleModel}
            onChangeText={(v) => update('myVehicleModel', v)}
          />

          <Text style={styles.label}>내 사고 차량 번호 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 12가 3456"
            value={form.myVehiclePlate}
            onChangeText={(v) => update('myVehiclePlate', v)}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>← 이전</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, styles.nextBtnFlex, (!form.vehicleCategory || !form.myVehicleModel || !form.myVehiclePlate) && styles.nextBtnDisabled]}
              onPress={() => setStep(3)}
              disabled={!form.vehicleCategory || !form.myVehicleModel || !form.myVehiclePlate}
            >
              <Text style={styles.nextBtnText}>다음 →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 3: 보험 및 기타 */}
      {step === 3 && (
        <View style={styles.section}>
          <Text style={styles.stepTitle}>보험 정보 (선택)</Text>

          <Text style={styles.label}>보험사</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 삼성화재, 현대해상"
            value={form.insuranceCompany}
            onChangeText={(v) => update('insuranceCompany', v)}
          />

          <Text style={styles.label}>사고 접수 번호</Text>
          <TextInput
            style={styles.input}
            placeholder="보험사 사고 접수 번호"
            value={form.insuranceNumber}
            onChangeText={(v) => update('insuranceNumber', v)}
          />

          <Text style={styles.label}>메모</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="업체에 전달할 추가 요청사항"
            value={form.memo}
            onChangeText={(v) => update('memo', v)}
            multiline
            numberOfLines={3}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backBtnText}>← 이전</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitBtn, loading && styles.nextBtnDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.submitBtnText}>대차 신청하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.white,
    gap: 12,
  },
  progressLine: { position: 'absolute', height: 2, width: '60%', backgroundColor: colors.border, zIndex: -1 },
  progressDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center',
  },
  progressDotActive: { backgroundColor: colors.primary },
  progressDotText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  progressDotTextActive: { color: colors.text },
  section: { padding: 20 },
  stepTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
    padding: 14, fontSize: 15, backgroundColor: colors.white,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
  },
  optionBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionBtnText: { fontSize: 13, color: colors.textSecondary },
  optionBtnTextActive: { color: colors.text, fontWeight: '700' },
  categoryBtn: {
    padding: 14, borderRadius: 10, borderWidth: 1.5,
    borderColor: colors.border, backgroundColor: colors.white, marginBottom: 8,
  },
  categoryBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  categoryBtnText: { fontSize: 14, color: colors.textSecondary },
  categoryBtnTextActive: { color: colors.text, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  backBtnText: { fontSize: 15, color: colors.textSecondary },
  nextBtn: {
    backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24,
  },
  nextBtnFlex: { flex: 2, marginTop: 0 },
  nextBtnDisabled: { backgroundColor: colors.border },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: colors.text },
  submitBtn: {
    flex: 2, backgroundColor: colors.text, borderRadius: 12, padding: 16, alignItems: 'center',
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});

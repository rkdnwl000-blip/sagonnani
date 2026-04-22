import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { colors } from '../../src/theme/colors';

const STEPS = [
  { icon: '📝', title: '사고 정보 입력', desc: '사고 유형, 장소, 차량 정보를 입력합니다.' },
  { icon: '🔍', title: '업체 매칭', desc: '등록된 업체에서 실시간으로 견적을 보냅니다.' },
  { icon: '✅', title: '견적 확인/선택', desc: '가격, 차량, 업체 평점을 비교해 선택합니다.' },
  { icon: '📸', title: '차량 인수 + 사진', desc: '차량 수령 시 앱으로 부위별 사진을 촬영합니다.' },
];

export default function HomeScreen() {
  const { user } = useSelector((s: RootState) => s.auth);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 환영 배너 */}
      <View style={styles.banner}>
        <Text style={styles.bannerGreet}>안녕하세요, {user?.name || '고객'}님</Text>
        <Text style={styles.bannerTitle}>사고 대차, 지금 바로{'\n'}신청하세요</Text>
        <TouchableOpacity style={styles.bannerBtn} onPress={() => router.push('/(tabs)/new-request')}>
          <Text style={styles.bannerBtnText}>🚗 대차 신청하기</Text>
        </TouchableOpacity>
      </View>

      {/* 이용 안내 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>이용 방법</Text>
        {STEPS.map((step, i) => (
          <View key={i} style={styles.stepCard}>
            <View style={styles.stepIconWrap}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 내 요청 바로가기 */}
      <TouchableOpacity style={styles.myRequestBtn} onPress={() => router.push('/(tabs)/my-requests')}>
        <Text style={styles.myRequestBtnText}>📋 내 대차 요청 확인하기 →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  banner: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 32,
  },
  bannerGreet: { fontSize: 14, color: colors.textSecondary },
  bannerTitle: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 4, lineHeight: 34 },
  bannerBtn: {
    backgroundColor: colors.text,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  bannerBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 16 },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stepIconWrap: { position: 'relative', marginRight: 14 },
  stepIcon: { fontSize: 32 },
  stepNumber: {
    position: 'absolute', right: -4, bottom: -4,
    backgroundColor: colors.primary, color: colors.text,
    fontSize: 10, fontWeight: '800',
    width: 18, height: 18, borderRadius: 9,
    textAlign: 'center', lineHeight: 18,
  },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  stepDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  myRequestBtn: {
    margin: 20,
    marginTop: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  myRequestBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
});

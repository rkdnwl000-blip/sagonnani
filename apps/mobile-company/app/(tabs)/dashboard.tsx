import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../src/store/authSlice';
import { companyApi } from '../../src/services/api';
import { AppDispatch, RootState } from '../../src/store';
import { colors } from '../../src/theme/colors';

export default function DashboardScreen() {
  const { company } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([companyApi.getProfile(), companyApi.getTransactions()]).then(([p, t]: any) => {
      setProfile(p);
      setTransactions(t);
      setLoading(false);
    });
  }, []);

  // 충전 후 돌아왔을 때 잔액 새로고침
  useFocusEffect(loadData);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: async () => { await dispatch(logout()); router.replace('/(auth)/login'); } },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container}>
      {/* 업체 카드 */}
      <View style={styles.companyCard}>
        <Text style={styles.companyName}>{profile?.businessName}</Text>
        <Text style={styles.companyOwner}>{profile?.ownerName} 대표</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>★ {profile?.rating?.toFixed(1) || '-'}</Text>
          <Text style={styles.ratingCount}>({profile?.ratingCount || 0}건)</Text>
        </View>
      </View>

      {/* 잔액 */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>수수료 잔액</Text>
        <Text style={styles.balanceAmount}>{profile?.commissionBalance?.toLocaleString() || 0}원</Text>
        <Text style={styles.balanceNote}>견적 수락 시 건당 15,000원 차감됩니다</Text>
        <TouchableOpacity style={styles.chargeBtn} onPress={() => router.push('/charge')}>
          <Text style={styles.chargeBtnText}>+ 잔액 충전하기</Text>
        </TouchableOpacity>
      </View>

      {/* 최근 거래 내역 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 거래 내역</Text>
        {transactions.length === 0 ? (
          <Text style={styles.noTx}>거래 내역이 없습니다.</Text>
        ) : (
          transactions.slice(0, 10).map((tx: any) => (
            <View key={tx.id} style={styles.txRow}>
              <View>
                <Text style={styles.txType}>{tx.type === 'CHARGE' ? '충전' : tx.type === 'DEDUCT' ? '수수료 차감' : '환불'}</Text>
                <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString('ko-KR')}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.success : colors.error }]}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
              </Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  companyCard: { backgroundColor: colors.primary, padding: 24, alignItems: 'center' },
  companyName: { fontSize: 22, fontWeight: '900', color: colors.text },
  companyOwner: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  rating: { fontSize: 18, fontWeight: '800', color: colors.text },
  ratingCount: { fontSize: 13, color: colors.textSecondary },
  balanceCard: { margin: 16, backgroundColor: colors.text, borderRadius: 16, padding: 20 },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontWeight: '900', color: colors.primary },
  balanceNote: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 8 },
  chargeBtn: { marginTop: 14, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start' },
  chargeBtnText: { fontSize: 14, fontWeight: '800', color: colors.text },
  section: { margin: 16, backgroundColor: colors.white, borderRadius: 14, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  noTx: { fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 12 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  txType: { fontSize: 14, fontWeight: '600', color: colors.text },
  txDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '800' },
  logoutBtn: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: colors.error, alignItems: 'center', marginBottom: 40 },
  logoutBtnText: { fontSize: 15, fontWeight: '700', color: colors.error },
});

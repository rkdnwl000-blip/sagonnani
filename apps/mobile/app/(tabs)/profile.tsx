import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../src/store/authSlice';
import { AppDispatch, RootState } from '../../src/store';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 프로필 카드 */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      {/* 메뉴 */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/my-requests')}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>내 대차 요청 내역</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  profileCard: {
    backgroundColor: colors.primary, padding: 32, alignItems: 'center',
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.text, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.white },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  phone: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  menu: { margin: 16, backgroundColor: colors.white, borderRadius: 14, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, color: colors.text },
  menuArrow: { fontSize: 16, color: colors.textMuted },
  logoutBtn: {
    margin: 16, padding: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.error, alignItems: 'center',
  },
  logoutBtnText: { fontSize: 15, fontWeight: '700', color: colors.error },
});

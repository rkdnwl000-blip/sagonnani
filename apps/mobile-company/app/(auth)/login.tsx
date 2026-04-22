import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginCompany } from '../../src/store/authSlice';
import { AppDispatch, RootState } from '../../src/store';
import { colors } from '../../src/theme/colors';

export default function CompanyLoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.auth);

  const handleLogin = async () => {
    const result = await dispatch(loginCompany({ phone, password }));
    if (loginCompany.fulfilled.match(result)) {
      const company = result.payload.company;
      if (company.status === 'PENDING') {
        Alert.alert('승인 대기', '관리자 승인 후 이용 가능합니다.');
        return;
      }
      router.replace('/(tabs)');
    } else {
      Alert.alert('로그인 실패', result.payload as string);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.logo}>사고났니?</Text>
        <Text style={styles.tag}>업체 파트너 앱</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>업체 전화번호</Text>
        <TextInput style={styles.input} placeholder="010-9876-5432" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={styles.label}>비밀번호</Text>
        <TextInput style={styles.input} placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.btnText}>로그인</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerLinkText}>업체 가입 신청 →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '900', color: colors.text },
  tag: { fontSize: 13, color: colors.textSecondary, marginTop: 4, fontWeight: '600' },
  form: { flex: 1, padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: colors.backgroundGray },
  btn: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  btnText: { fontSize: 17, fontWeight: '700', color: colors.text },
  registerLink: { alignItems: 'center', marginTop: 16 },
  registerLinkText: { color: colors.info, fontSize: 15, fontWeight: '600' },
});

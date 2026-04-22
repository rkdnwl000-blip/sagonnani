import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../src/store/authSlice';
import { AppDispatch, RootState } from '../../src/store';
import { colors } from '../../src/theme/colors';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.auth);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('입력 오류', '전화번호와 비밀번호를 입력해주세요.');
      return;
    }
    const result = await dispatch(loginUser({ phone, password }));
    if (loginUser.fulfilled.match(result)) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('로그인 실패', result.payload as string);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logo}>사고났니?</Text>
        <Text style={styles.subtitle}>사고 대차 중개 플랫폼</Text>
      </View>

      {/* 폼 */}
      <View style={styles.form}>
        <Text style={styles.label}>휴대폰 번호</Text>
        <TextInput
          style={styles.input}
          placeholder="010-1234-5678"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.loginBtnText}>로그인</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerBtnText}>아직 계정이 없으신가요? <Text style={{ fontWeight: 'bold' }}>회원가입</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: { fontSize: 36, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  form: { flex: 1, padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.backgroundGray,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  loginBtnText: { fontSize: 17, fontWeight: '700', color: colors.text },
  registerBtn: { alignItems: 'center', marginTop: 16 },
  registerBtnText: { color: colors.textSecondary, fontSize: 14 },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../src/store/authSlice';
import { AppDispatch } from '../../src/store';
import { colors } from '../../src/theme/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.password) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    const result = await dispatch(registerUser({ name: form.name, phone: form.phone, password: form.password }));
    setLoading(false);

    if (registerUser.fulfilled.match(result)) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('회원가입 실패', result.payload as string);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>회원가입</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: '이름', key: 'name', placeholder: '홍길동', keyboard: 'default' },
            { label: '휴대폰 번호', key: 'phone', placeholder: '010-1234-5678', keyboard: 'phone-pad' },
            { label: '비밀번호', key: 'password', placeholder: '6자 이상', keyboard: 'default', secure: true },
            { label: '비밀번호 확인', key: 'confirmPassword', placeholder: '비밀번호 재입력', keyboard: 'default', secure: true },
          ].map((field) => (
            <View key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                value={(form as any)[field.key]}
                onChangeText={(v) => update(field.key, v)}
                keyboardType={field.keyboard as any}
                secureTextEntry={field.secure}
                autoCapitalize="none"
              />
            </View>
          ))}

          <Text style={styles.agreeText}>
            회원가입 시{' '}
            <Text style={styles.agreeLink} onPress={() => Linking.openURL(`${API_BASE}/legal/terms`)}>
              이용약관
            </Text>
            {' '}및{' '}
            <Text style={styles.agreeLink} onPress={() => Linking.openURL(`${API_BASE}/legal/privacy`)}>
              개인정보처리방침
            </Text>
            에 동의합니다.
          </Text>

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.registerBtnText}>회원가입 완료</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 16, color: colors.text },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  form: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.backgroundGray,
  },
  agreeText: { fontSize: 12, color: colors.textSecondary, marginTop: 20, textAlign: 'center', lineHeight: 18 },
  agreeLink: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '700' },
  registerBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  registerBtnText: { fontSize: 17, fontWeight: '700', color: colors.text },
});

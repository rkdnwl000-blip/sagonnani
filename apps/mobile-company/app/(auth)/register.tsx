import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator, Linking,
} from 'react-native';
import { router } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
import { useDispatch } from 'react-redux';
import { registerCompany } from '../../src/store/authSlice';
import { AppDispatch } from '../../src/store';
import { colors } from '../../src/theme/colors';

export default function CompanyRegisterScreen() {
  const [form, setForm] = useState({
    businessName: '',
    businessNumber: '',
    ownerName: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const { businessName, businessNumber, ownerName, phone, address, password, confirmPassword } = form;

    if (!businessName || !businessNumber || !ownerName || !phone || !address || !password) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    const result = await dispatch(registerCompany({ businessName, businessNumber, ownerName, phone, address, password }));
    setLoading(false);

    if (registerCompany.fulfilled.match(result)) {
      Alert.alert(
        '가입 신청 완료',
        '관리자 승인 후 로그인할 수 있습니다.\n승인까지 1~2 영업일이 소요됩니다.',
        [{ text: '확인', onPress: () => router.replace('/(auth)/login') }],
      );
    } else {
      Alert.alert('가입 실패', result.payload as string);
    }
  };

  const fields = [
    { label: '업체명 *', key: 'businessName', placeholder: '(주)빠른대차', keyboard: 'default' },
    { label: '사업자등록번호 *', key: 'businessNumber', placeholder: '123-45-67890', keyboard: 'numeric' },
    { label: '대표자명 *', key: 'ownerName', placeholder: '홍길동', keyboard: 'default' },
    { label: '업체 전화번호 *', key: 'phone', placeholder: '010-9876-5432', keyboard: 'phone-pad' },
    { label: '업체 주소 *', key: 'address', placeholder: '서울시 강남구 테헤란로 123', keyboard: 'default' },
    { label: '비밀번호 *', key: 'password', placeholder: '6자 이상', keyboard: 'default', secure: true },
    { label: '비밀번호 확인 *', key: 'confirmPassword', placeholder: '비밀번호 재입력', keyboard: 'default', secure: true },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>업체 가입 신청</Text>
          <Text style={styles.subtitle}>관리자 승인 후 서비스를 이용할 수 있습니다</Text>
        </View>

        <View style={styles.form}>
          {fields.map((field) => (
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

          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {'• 가입 후 관리자 승인이 필요합니다 (1~2 영업일)\n'}
              {'• 승인 전 로그인 시 대기 안내가 표시됩니다\n'}
              {'• 차량 등록 및 견적 제출은 승인 후 가능합니다'}
            </Text>
          </View>

          <Text style={styles.agreeText}>
            가입 시{' '}
            <Text style={styles.agreeLink} onPress={() => Linking.openURL(`${API_BASE}/legal/terms`)}>이용약관</Text>
            {' '}및{' '}
            <Text style={styles.agreeLink} onPress={() => Linking.openURL(`${API_BASE}/legal/privacy`)}>개인정보처리방침</Text>
            에 동의합니다.
          </Text>

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.registerBtnText}>가입 신청</Text>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 16, color: colors.text },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  form: { padding: 24, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.backgroundGray,
  },
  notice: {
    backgroundColor: colors.info + '15',
    borderRadius: 10,
    padding: 14,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.info + '40',
  },
  noticeText: { fontSize: 13, color: colors.info, lineHeight: 20 },
  agreeText: { fontSize: 12, color: colors.textSecondary, marginTop: 16, textAlign: 'center', lineHeight: 18 },
  agreeLink: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '700' },
  registerBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  registerBtnText: { fontSize: 17, fontWeight: '700', color: colors.text },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { router } from 'expo-router';
import { paymentsApi } from '../src/services/api';
import { colors } from '../src/theme/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
// 딥링크 스킴 (app.json scheme과 일치)
const DEEP_LINK_SCHEME = 'sagonnani-company';

const AMOUNTS = [30000, 50000, 100000, 200000, 300000, 500000];

export default function ChargeScreen() {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const amount = selected ?? (custom ? parseInt(custom.replace(/[^0-9]/g, '')) : 0);

  const handlePrepare = async () => {
    if (!amount || amount < 10000) {
      Alert.alert('알림', '최소 충전 금액은 10,000원입니다.');
      return;
    }
    setLoading(true);
    try {
      const res: any = await paymentsApi.prepare(amount);

      // 리디렉션 서버의 checkout 페이지로 이동
      const params = new URLSearchParams({
        orderId: res.orderId,
        amount: String(amount),
        orderName: res.orderName,
        customerName: res.customerName,
        scheme: DEEP_LINK_SCHEME,
      });
      setWebviewUrl(`${API_BASE}/payments/web/checkout?${params.toString()}`);
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  };

  // WebView 내비게이션 변경 감지 → 딥링크 캐치
  const handleNavChange = (navState: WebViewNavigation) => {
    const url = navState.url;

    if (url.startsWith(`${DEEP_LINK_SCHEME}://payment/success`)) {
      const urlObj = new URL(url.replace(`${DEEP_LINK_SCHEME}://`, 'https://dummy.app/'));
      const paymentKey = urlObj.searchParams.get('paymentKey') || '';
      const orderId = urlObj.searchParams.get('orderId') || '';
      const pgAmount = parseInt(urlObj.searchParams.get('amount') || '0');

      setWebviewUrl(null);
      setConfirming(true);

      paymentsApi
        .confirm({ paymentKey, orderId, amount: pgAmount })
        .then(() => {
          Alert.alert('충전 완료!', `${pgAmount.toLocaleString()}원이 충전되었습니다.`, [
            { text: '확인', onPress: () => router.back() },
          ]);
        })
        .catch((e: any) => {
          Alert.alert('결제 오류', e.message || '서버 확인 중 오류가 발생했습니다.');
        })
        .finally(() => setConfirming(false));
    }

    if (url.startsWith(`${DEEP_LINK_SCHEME}://payment/fail`)) {
      setWebviewUrl(null);
      Alert.alert('결제 취소', '결제가 취소되었습니다.');
    }
  };

  return (
    <>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>수수료 잔액 충전</Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>💡 수수료 안내</Text>
          <Text style={styles.noticeText}>
            견적이 수락될 때마다 15,000원이 차감됩니다.{'\n'}
            잔액이 15,000원 미만이면 견적을 보낼 수 없습니다.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>충전 금액 선택</Text>
        <View style={styles.amountGrid}>
          {AMOUNTS.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.amountBtn, selected === a && styles.amountBtnActive]}
              onPress={() => { setSelected(a); setCustom(''); }}
            >
              <Text style={[styles.amountBtnText, selected === a && styles.amountBtnTextActive]}>
                {a.toLocaleString()}원
              </Text>
              {a >= 100000 && (
                <Text style={[styles.amountBtnSub, selected === a && styles.amountBtnSubActive]}>
                  {Math.floor(a / 15000)}회 사용 가능
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>직접 입력</Text>
        <View style={styles.customInputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="10,000 이상"
            placeholderTextColor={colors.textMuted}
            value={custom}
            onChangeText={(v) => {
              setCustom(v.replace(/[^0-9]/g, ''));
              setSelected(null);
            }}
          />
          <Text style={styles.inputSuffix}>원</Text>
        </View>

        {amount >= 10000 && (
          <View style={styles.summary}>
            <View>
              <Text style={styles.summaryLabel}>충전 금액</Text>
              <Text style={styles.summaryNote}>{Math.floor(amount / 15000)}회 견적 수락 가능</Text>
            </View>
            <Text style={styles.summaryAmount}>{amount.toLocaleString()}원</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.payBtn, (!amount || amount < 10000 || loading) && styles.payBtnDisabled]}
          onPress={handlePrepare}
          disabled={!amount || amount < 10000 || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Text style={styles.payBtnText}>토스페이먼츠로 결제</Text>
              <Text style={styles.payBtnSub}>카드 · 계좌이체 · 간편결제</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* 결제 WebView 모달 */}
      <Modal visible={!!webviewUrl} animationType="slide" statusBarTranslucent>
        <View style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('결제 취소', '결제를 취소하시겠습니까?', [
                  { text: '계속 진행', style: 'cancel' },
                  { text: '취소', style: 'destructive', onPress: () => setWebviewUrl(null) },
                ]);
              }}
            >
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>수수료 충전</Text>
            <View style={{ width: 32 }} />
          </View>

          {webviewUrl && (
            <WebView
              source={{ uri: webviewUrl }}
              onNavigationStateChange={handleNavChange}
              onShouldStartLoadWithRequest={(req) => {
                // 딥링크는 WebView에서 열지 않고 앱에서 처리
                if (req.url.startsWith(DEEP_LINK_SCHEME + '://')) {
                  handleNavChange(req as any);
                  return false;
                }
                return true;
              }}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webviewLoading}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.webviewLoadingText}>결제 수단을 불러오는 중...</Text>
                </View>
              )}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
            />
          )}
        </View>
      </Modal>

      {/* 결제 확인 중 오버레이 */}
      {confirming && (
        <View style={styles.confirmingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.confirmingText}>결제를 확인하는 중...</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, paddingTop: 52, backgroundColor: colors.primary,
  },
  backBtn: { marginRight: 12, padding: 4 },
  backBtnText: { fontSize: 22, fontWeight: '700', color: colors.text },
  title: { fontSize: 18, fontWeight: '900', color: colors.text },

  notice: {
    margin: 16, backgroundColor: '#FFFBEA',
    borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: '#FFD600',
  },
  noticeTitle: { fontSize: 14, fontWeight: '800', color: '#856A00', marginBottom: 6 },
  noticeText: { fontSize: 13, color: '#856A00', lineHeight: 20 },

  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: colors.textSecondary,
    marginHorizontal: 16, marginTop: 20, marginBottom: 10, textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  amountGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10,
  },
  amountBtn: {
    width: '30%', paddingVertical: 14,
    borderRadius: 14, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.white, alignItems: 'center',
  },
  amountBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  amountBtnText: { fontSize: 14, fontWeight: '800', color: colors.textSecondary },
  amountBtnTextActive: { color: colors.text },
  amountBtnSub: { fontSize: 10, color: colors.textMuted, marginTop: 3 },
  amountBtnSubActive: { color: colors.text + 'AA' },

  customInputRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, backgroundColor: colors.white,
    borderRadius: 14, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1, fontSize: 20, fontWeight: '800',
    paddingVertical: 14, color: colors.text,
  },
  inputSuffix: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' },

  summary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    margin: 16, backgroundColor: colors.white,
    borderRadius: 14, padding: 18,
    borderWidth: 2, borderColor: colors.primary,
  },
  summaryLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  summaryNote: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  summaryAmount: { fontSize: 24, fontWeight: '900', color: colors.text },

  payBtn: {
    margin: 16, marginTop: 8, marginBottom: 48,
    backgroundColor: colors.primary, borderRadius: 16,
    padding: 18, alignItems: 'center',
  },
  payBtnDisabled: { opacity: 0.35 },
  payBtnText: { fontSize: 17, fontWeight: '900', color: colors.text },
  payBtnSub: { fontSize: 12, color: colors.text + 'AA', marginTop: 3 },

  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, paddingTop: 52,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  modalClose: { fontSize: 18, color: colors.textSecondary, fontWeight: '700', padding: 4 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.text },

  webviewLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5',
  },
  webviewLoadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary },

  confirmingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  confirmingText: { marginTop: 16, fontSize: 16, fontWeight: '700', color: '#fff' },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { photosApi } from '../../../src/services/api';
import { colors } from '../../../src/theme/colors';
import { PhotoAngle } from '@sagonnani/shared';

const REQUIRED_ANGLES: { key: string; label: string; icon: string }[] = [
  { key: PhotoAngle.FRONT, label: '정면', icon: '⬆️' },
  { key: PhotoAngle.REAR, label: '후면', icon: '⬇️' },
  { key: PhotoAngle.LEFT, label: '좌측', icon: '⬅️' },
  { key: PhotoAngle.RIGHT, label: '우측', icon: '➡️' },
  { key: PhotoAngle.FRONT_LEFT, label: '전방 좌측', icon: '↖️' },
  { key: PhotoAngle.FRONT_RIGHT, label: '전방 우측', icon: '↗️' },
  { key: PhotoAngle.REAR_LEFT, label: '후방 좌측', icon: '↙️' },
  { key: PhotoAngle.REAR_RIGHT, label: '후방 우측', icon: '↘️' },
  { key: PhotoAngle.DASHBOARD, label: '계기판', icon: '🎛️' },
  { key: PhotoAngle.WHEEL_FRONT_LEFT, label: '앞 좌측 휠', icon: '⚙️' },
  { key: PhotoAngle.WHEEL_FRONT_RIGHT, label: '앞 우측 휠', icon: '⚙️' },
  { key: PhotoAngle.WHEEL_REAR_LEFT, label: '뒤 좌측 휠', icon: '⚙️' },
  { key: PhotoAngle.WHEEL_REAR_RIGHT, label: '뒤 우측 휠', icon: '⚙️' },
];

export default function PhotosScreen() {
  const { id, phase = 'PICKUP' } = useLocalSearchParams<{ id: string; phase: string }>();
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const takePhoto = async (angle: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(angle);
      try {
        // Presigned URL 발급
        const { uploadUrl, publicUrl }: any = await photosApi.getUploadUrl(id, angle, phase);

        // S3에 직접 업로드
        const file = result.assets[0];
        const response = await fetch(file.uri);
        const blob = await response.blob();
        await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/jpeg' } });

        // 메타데이터 저장
        await photosApi.saveRecord(id, { angle, phase, url: publicUrl });

        setPhotos((p) => ({ ...p, [angle]: file.uri }));
      } catch (e: any) {
        Alert.alert('업로드 실패', e.message);
      } finally {
        setUploading(null);
      }
    }
  };

  const allDone = REQUIRED_ANGLES.every((a) => photos[a.key]);

  const handleComplete = async () => {
    if (!allDone) {
      Alert.alert('미완성', '모든 부위 사진을 촬영해주세요.');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    Alert.alert('완료!', '차량 사진이 안전하게 저장되었습니다.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  const phaseName = phase === 'PICKUP' ? '인수' : '반납';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>차량 {phaseName} 사진</Text>
        <Text style={styles.progress}>{Object.keys(photos).length}/{REQUIRED_ANGLES.length}</Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>📸 분쟁 방지를 위해 모든 부위 사진을 촬영해주세요. 사진은 서버에 안전하게 보관됩니다.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {REQUIRED_ANGLES.map((angle) => {
          const taken = !!photos[angle.key];
          const isUploading = uploading === angle.key;

          return (
            <TouchableOpacity
              key={angle.key}
              style={[styles.photoSlot, taken && styles.photoSlotDone]}
              onPress={() => takePhoto(angle.key)}
              disabled={!!uploading}
            >
              {isUploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : taken ? (
                <>
                  <Image source={{ uri: photos[angle.key] }} style={styles.photoThumb} />
                  <View style={styles.checkOverlay}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.angleIcon}>{angle.icon}</Text>
                  <Text style={styles.angleLabel}>{angle.label}</Text>
                  <Text style={styles.tapText}>탭하여 촬영</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeBtn, !allDone && styles.completeBtnDisabled]}
          onPress={handleComplete}
          disabled={!allDone || saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.completeBtnText}>
              {allDone ? `✓ ${phaseName} 사진 저장 완료` : `${REQUIRED_ANGLES.length - Object.keys(photos).length}장 남음`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56, backgroundColor: colors.primary,
  },
  backText: { fontSize: 16, color: colors.text },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  progress: { fontSize: 14, fontWeight: '700', color: colors.text },
  notice: { backgroundColor: colors.primaryLight, padding: 12 },
  noticeText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  grid: { padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoSlot: {
    width: '47%', aspectRatio: 1, borderRadius: 12, borderWidth: 2,
    borderColor: colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.backgroundGray, overflow: 'hidden',
  },
  photoSlotDone: { borderStyle: 'solid', borderColor: colors.success },
  photoThumb: { width: '100%', height: '100%', borderRadius: 10 },
  checkOverlay: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center',
  },
  checkIcon: { color: colors.white, fontSize: 14, fontWeight: '800' },
  angleIcon: { fontSize: 28, marginBottom: 6 },
  angleLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
  tapText: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  footer: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  completeBtn: {
    backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  completeBtnDisabled: { backgroundColor: colors.border },
  completeBtnText: { fontSize: 16, fontWeight: '800', color: colors.text },
});

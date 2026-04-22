import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { store } from '../src/store';
import { authApi } from '../src/services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications() {
  if (Platform.OS === 'web') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    const authToken = await SecureStore.getItemAsync('company_auth_token');
    if (authToken) {
      await authApi.updateFcmToken(token.data);
    }
  } catch (e) {
    // FCM 토큰 등록 실패는 앱 실행을 막지 않음
  }
}

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  return (
    <Provider store={store}>
      <StatusBar style="dark" backgroundColor="#FFD600" />
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
}

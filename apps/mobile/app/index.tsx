import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('auth_token')
      .then((token) => setHasToken(!!token))
      .catch(() => setHasToken(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD600' }}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

  return <Redirect href={hasToken ? '/(tabs)' : '/(auth)/login'} />;
}

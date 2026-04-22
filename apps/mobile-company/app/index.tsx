import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/theme/colors';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('company_auth_token').then((t) => {
      setHasToken(!!t);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
      <ActivityIndicator size="large" color={colors.text} />
    </View>
  );

  return <Redirect href={hasToken ? '/(tabs)' : '/(auth)/login'} />;
}

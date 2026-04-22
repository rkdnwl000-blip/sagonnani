import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { colors } from '../../src/theme/colors';

function BadgeIcon({ emoji, count }: { emoji: string; count?: number }) {
  return (
    <View style={{ position: 'relative' }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      {count && count > 0 ? (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: '#FF3B30', borderRadius: 10,
          minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  const requestCount = useSelector((s: RootState) => s.requestBadge.count);

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.text,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { backgroundColor: colors.white, height: 60, paddingBottom: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      headerStyle: { backgroundColor: colors.primary },
      headerTitleStyle: { fontWeight: '800', fontSize: 18 },
    }}>
      <Tabs.Screen name="index" options={{
        title: '신규 요청',
        headerTitle: '대차 요청 목록',
        tabBarIcon: ({ focused }) => (
          <BadgeIcon emoji={focused ? '🔔' : '🔕'} count={requestCount} />
        ),
      }} />
      <Tabs.Screen name="my-quotes" options={{
        title: '내 견적',
        headerTitle: '보낸 견적 목록',
        tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22 }}>{focused ? '📄' : '📃'}</Text>,
      }} />
      <Tabs.Screen name="vehicles" options={{
        title: '차량 관리',
        tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22 }}>{focused ? '🚗' : '🚙'}</Text>,
      }} />
      <Tabs.Screen name="dashboard" options={{
        title: '내 현황',
        tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22 }}>{focused ? '📊' : '📈'}</Text>,
      }} />
    </Tabs>
  );
}

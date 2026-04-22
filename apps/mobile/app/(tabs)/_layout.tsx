import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: colors.primary },
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          headerTitle: '사고났니?',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22 }}>{focused ? '🏠' : '🏡'}</Text>,
        }}
      />
      <Tabs.Screen
        name="new-request"
        options={{
          title: '대차 신청',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22 }}>{focused ? '🚗' : '🚙'}</Text>,
        }}
      />
      <Tabs.Screen
        name="my-requests"
        options={{
          title: '내 요청',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22 }}>{focused ? '📋' : '📄'}</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '내 정보',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22 }}>{focused ? '👤' : '👥'}</Text>,
        }}
      />
    </Tabs>
  );
}

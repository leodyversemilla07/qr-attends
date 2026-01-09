import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/utils/theme-context';

export default function TabLayout() {
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#151718' : '#fff';
  const borderColor = isDark ? '#2D2D2D' : '#E2E8F0';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#3B82F6' : '#2563EB',
        tabBarInactiveTintColor: isDark ? '#9BA1A6' : '#687076',
        headerShown: false,
        tabBarStyle: {
          backgroundColor,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

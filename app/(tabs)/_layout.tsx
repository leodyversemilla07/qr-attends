import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const { colors, dark: isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const backgroundColor = colors.background;
  const borderColor = colors.outline;

  // Calculate bottom padding to account for system navigation bar
  // On Android with gesture navigation, insets.bottom will be ~48px
  // On Android with 3-button navigation, insets.bottom will be 0 (system handles it)
  // Add extra padding to ensure content doesn't get cut off
  const bottomInset = insets.bottom;
  const bottomPadding = Platform.OS === 'ios' 
    ? Math.max(insets.bottom, 20) 
    : Math.max(bottomInset, 16);
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 60 + bottomPadding;

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
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 10,
          // Ensure the tab bar is positioned above the system navigation
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
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

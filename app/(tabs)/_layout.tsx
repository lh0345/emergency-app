import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surfaceElevated,
          borderTopColor: theme.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="prepare"
        options={{
          title: 'Prepare',
          tabBarIcon: ({ color }) => (
            <Ionicons name="shield-checkmark-outline" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'People',
          tabBarIcon: ({ color }) => <Ionicons name="people" color={color} size={22} />,
        }}
      />
      <Tabs.Screen name="plans" options={{ href: null }} />
      <Tabs.Screen name="supplies" options={{ href: null }} />
      <Tabs.Screen name="library" options={{ href: null }} />
    </Tabs>
  );
}

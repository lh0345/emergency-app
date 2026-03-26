import { Stack } from 'expo-router';
import React from 'react';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function EmergencyLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surfaceElevated },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Emergency mode' }} />
      <Stack.Screen name="[scenario]" options={{ title: 'Steps' }} />
      <Stack.Screen name="checklist" options={{ title: 'Checklist' }} />
    </Stack>
  );
}

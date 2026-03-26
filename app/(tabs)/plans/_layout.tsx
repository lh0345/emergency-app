import { Stack } from 'expo-router';
import React from 'react';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function PlansStackLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Plans' }} />
      <Stack.Screen name="new" options={{ title: 'New plan' }} />
      <Stack.Screen name="[id]" options={{ title: 'Plan' }} />
    </Stack>
  );
}

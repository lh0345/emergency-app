import { Stack } from 'expo-router';
import React from 'react';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function SuppliesStackLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Supplies' }} />
      <Stack.Screen name="add" options={{ title: 'Add supply' }} />
      <Stack.Screen name="[id]" options={{ title: 'Supply' }} />
    </Stack>
  );
}

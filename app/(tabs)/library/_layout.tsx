import { Stack } from 'expo-router';
import React from 'react';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function LibraryStackLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Guides' }} />
      <Stack.Screen name="[id]" options={{ title: 'Guide' }} />
    </Stack>
  );
}

import { Stack } from 'expo-router';
import React from 'react';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function SavedLocationsStackLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Saved locations' }} />
      <Stack.Screen name="new" options={{ title: 'Add location' }} />
      <Stack.Screen name="[id]" options={{ title: 'Location' }} />
    </Stack>
  );
}

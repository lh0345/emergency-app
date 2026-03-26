import { Stack } from 'expo-router';
import React from 'react';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ContactsStackLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Contacts' }} />
      <Stack.Screen name="add" options={{ title: 'Add contact' }} />
      <Stack.Screen name="[id]" options={{ title: 'Contact' }} />
      <Stack.Screen name="settings" options={{ title: 'App settings' }} />
      <Stack.Screen name="household" options={{ title: 'Household profile' }} />
      <Stack.Screen name="locations" options={{ headerShown: false }} />
    </Stack>
  );
}

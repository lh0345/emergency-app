import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';

export function AppCard({ style, children, ...rest }: ViewProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const theme = getThemeColors(isDark);

  return (
    <View
      style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
});

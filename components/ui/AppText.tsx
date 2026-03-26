import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

export function AppText({
  variant = 'body',
  muted,
  style,
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean }) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const theme = getThemeColors(isDark);
  const color = muted ? theme.textMuted : theme.text;

  return (
    <Text
      style={[styles.base, styles[variant], { color }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
  title: { fontSize: 24, fontWeight: '700', letterSpacing: 0.2 },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
});

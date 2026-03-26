import React from 'react';
import { StyleSheet, View } from 'react-native';

import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';

import { AppText } from './AppText';

type Tone = 'neutral' | 'warning' | 'success';

export function AppBadge({ text, tone = 'neutral' }: { text: string; tone?: Tone }) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const theme = getThemeColors(isDark);

  const bg =
    tone === 'warning'
      ? theme.warning + '33'
      : tone === 'success'
        ? theme.success + '33'
        : theme.border + '55';

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <AppText variant="caption" style={{ color: theme.text }}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';

export function ActionStepCard({ index, text }: { index: number; text: string }) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const n = index + 1;

  return (
    <AppCard
      style={[
        styles.card,
        {
          borderLeftWidth: 3,
          borderLeftColor: theme.accent,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <AppText style={styles.badgeText}>{n}</AppText>
        </View>
        <AppText style={[styles.text, { color: theme.text }]}>{text}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, borderRadius: radius.lg },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  text: { flex: 1, fontSize: 17, lineHeight: 25 },
});

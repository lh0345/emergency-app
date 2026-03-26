import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';

import type { GuideStep as GuideStepType } from '@/types';

export function GuideStep({ step, index }: { step: GuideStepType; index: number }) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const n = index + 1;

  return (
    <AppCard
      style={[
        styles.card,
        {
          borderLeftWidth: 3,
          borderLeftColor: theme.libraryAccent,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: theme.libraryAccent }]}>
          <AppText style={styles.badgeText}>{n}</AppText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="subtitle" style={{ color: theme.text }}>
            {step.title}
          </AppText>
          {step.detail ? (
            <AppText style={[styles.detail, { color: theme.text }]}>{step.detail}</AppText>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm, paddingVertical: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  detail: { marginTop: spacing.xs, lineHeight: 20, fontSize: 14 },
});

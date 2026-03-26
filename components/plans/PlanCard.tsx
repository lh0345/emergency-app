import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import type { PlanRow } from '@/types';

export function PlanCard({
  plan,
  onOpen,
  onDuplicate,
}: {
  plan: PlanRow;
  onOpen: () => void;
  onDuplicate: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <AppCard
      style={[
        styles.card,
        {
          borderLeftWidth: 4,
          borderLeftColor: theme.plansAccent,
          borderRadius: radius.lg,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={plan.title} style={styles.main}>
        <View style={[styles.iconWrap, { backgroundColor: theme.plansMuted }]}>
          <Ionicons name="map-outline" size={24} color={theme.plansAccent} />
        </View>
        <View style={styles.textCol}>
          <AppText variant="subtitle" style={{ color: theme.text }} numberOfLines={2}>
            {plan.title}
          </AppText>
          <AppText muted variant="caption" numberOfLines={2} style={styles.summary}>
            {plan.summary || plan.type}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.textMuted} style={styles.chevron} />
      </Pressable>
      <View style={styles.actions}>
        <Pressable
          onPress={() => onDuplicate()}
          style={({ pressed }) => [
            styles.dupBtn,
            {
              borderColor: theme.border,
              backgroundColor: theme.surface,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Duplicate plan"
        >
          <Ionicons name="copy-outline" size={20} color={theme.plansAccent} />
          <AppText variant="caption" style={{ color: theme.plansAccent, fontWeight: '600', marginLeft: spacing.sm }}>
            Duplicate
          </AppText>
        </Pressable>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  main: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  summary: { marginTop: 4, lineHeight: 20 },
  chevron: { opacity: 0.85 },
  actions: { marginTop: spacing.md, paddingLeft: 56 },
  dupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});

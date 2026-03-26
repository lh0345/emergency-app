import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';
import type { SupplyCategory } from '@/types';

const CATEGORY_ICONS: Record<SupplyCategory, keyof typeof Ionicons.glyphMap> = {
  Water: 'water-outline',
  Food: 'restaurant-outline',
  Power: 'flash-outline',
  Medicine: 'medical-outline',
  'Home resilience': 'home-outline',
  'Food growing': 'leaf-outline',
  Other: 'cube-outline',
};

export function SupplySummaryCard({
  category,
  count,
  lowStock,
}: {
  category: SupplyCategory;
  count: number;
  lowStock: boolean;
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const icon = CATEGORY_ICONS[category] ?? 'cube-outline';

  return (
    <AppCard
      style={[
        styles.card,
        {
          borderLeftWidth: 2,
          borderLeftColor: lowStock && count > 0 ? theme.warning : theme.suppliesAccent,
          borderRadius: radius.md,
        },
      ]}
    >
      <View style={styles.row}>
        <Ionicons name={icon} size={16} color={theme.suppliesAccent} style={styles.icon} />
        <AppText style={[styles.cat, { color: theme.text }]} numberOfLines={1}>
          {category}
        </AppText>
        <AppText variant="label" style={{ color: theme.suppliesAccent, fontSize: 14, fontWeight: '700' }}>
          {count}
        </AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: { opacity: 0.9 },
  cat: { flex: 1, fontSize: 13, fontWeight: '600' },
});

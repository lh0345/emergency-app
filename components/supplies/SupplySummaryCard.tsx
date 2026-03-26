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
          borderLeftWidth: 4,
          borderLeftColor: theme.suppliesAccent,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: theme.suppliesMuted }]}>
          <Ionicons name={icon} size={22} color={theme.suppliesAccent} />
        </View>
        <View style={styles.textCol}>
          <AppText variant="subtitle" style={{ color: theme.text }}>
            {category}
          </AppText>
          <AppText muted variant="caption">
            {count === 0 ? 'No items' : `${count} item${count === 1 ? '' : 's'}`}
          </AppText>
        </View>
        <View style={[styles.countPill, { backgroundColor: theme.suppliesMuted }]}>
          <AppText variant="label" style={{ color: theme.suppliesAccent, fontSize: 15 }}>
            {count}
          </AppText>
        </View>
      </View>
      {lowStock ? (
        <View style={styles.warnRow}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.warning} />
          <AppText variant="caption" style={{ color: theme.warning, marginLeft: spacing.sm, flex: 1, lineHeight: 18 }}>
            Some quantities look low — tap an item to review.
          </AppText>
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  countPill: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
});

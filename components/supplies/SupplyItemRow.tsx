import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { SUPPLY_CATEGORIES } from '@/constants/categories';
import { radius, spacing } from '@/constants/spacing';
import { calculateDaysLeft } from '@/utils/calculateDaysLeft';
import { formatDate } from '@/utils/formatDate';
import type { SupplyCategory, SupplyRow } from '@/types';

const CATEGORY_ICONS: Record<SupplyCategory, keyof typeof Ionicons.glyphMap> = {
  Water: 'water-outline',
  Food: 'restaurant-outline',
  Power: 'flash-outline',
  Medicine: 'medical-outline',
  Other: 'cube-outline',
};

function toCategory(cat: string): SupplyCategory {
  return SUPPLY_CATEGORIES.includes(cat as SupplyCategory) ? (cat as SupplyCategory) : 'Other';
}

export function SupplyItemRow({
  item,
  onPress,
}: {
  item: SupplyRow;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const days = calculateDaysLeft(item.expiryDate);
  const expiryWarn = days !== null && days <= 30 && days >= 0;
  const expired = days !== null && days < 0;
  const lowQty = item.quantity <= 1;
  const cat = toCategory(item.category);
  const icon = CATEGORY_ICONS[cat] ?? 'cube-outline';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, quantity ${item.quantity}`}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}
    >
      <AppCard
        style={[
          styles.card,
          {
            borderLeftWidth: 3,
            borderLeftColor: theme.suppliesAccent,
            borderRadius: radius.lg,
            paddingVertical: spacing.md,
            marginBottom: spacing.md,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: theme.suppliesMuted }]}>
            <Ionicons name={icon} size={18} color={theme.suppliesAccent} />
          </View>
          <View style={styles.textCol}>
            <AppText variant="subtitle" style={{ color: theme.text }} numberOfLines={2}>
              {item.name}
            </AppText>
            <AppText muted variant="caption" style={styles.meta}>
              {item.quantity} {item.unit || 'units'}
              {item.expiryDate ? ` · ${formatDate(item.expiryDate)}` : ''}
            </AppText>
            <View style={styles.badges}>
              <View style={[styles.catPill, { backgroundColor: theme.suppliesMuted }]}>
                <AppText variant="caption" style={{ color: theme.suppliesAccent, fontSize: 11, fontWeight: '600' }}>
                  {item.category}
                </AppText>
              </View>
              {lowQty ? <AppBadge text="Low" tone="warning" /> : null}
              {expired ? <AppBadge text="Expired" tone="warning" /> : null}
              {expiryWarn && !expired ? <AppBadge text="Soon" tone="neutral" /> : null}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.textMuted} style={styles.chevron} />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  meta: { marginTop: 4, lineHeight: 18 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  catPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  chevron: { opacity: 0.85 },
});

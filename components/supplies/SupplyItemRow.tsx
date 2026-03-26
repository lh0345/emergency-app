import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge } from '@/components/ui/AppBadge';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';
import { calculateDaysLeft } from '@/utils/calculateDaysLeft';
import { formatDate } from '@/utils/formatDate';
import type { SupplyRow } from '@/types';

export function SupplyItemRow({
  item,
  onPress,
}: {
  item: SupplyRow;
  onPress: () => void;
}) {
  const days = calculateDaysLeft(item.expiryDate);
  const expiryWarn = days !== null && days <= 30 && days >= 0;
  const expired = days !== null && days < 0;
  const lowQty = item.quantity <= 1;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, quantity ${item.quantity}`}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="subtitle">{item.name}</AppText>
        <AppText muted>
          {item.quantity} {item.unit || 'units'}
          {item.expiryDate ? ` · ${formatDate(item.expiryDate)}` : ''}
        </AppText>
      </View>
      <View style={styles.badges}>
        {lowQty ? <AppBadge text="Low" tone="warning" /> : null}
        {expired ? <AppBadge text="Expired" tone="warning" /> : null}
        {expiryWarn && !expired ? <AppBadge text="Expires soon" tone="neutral" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#33415555',
  },
  badges: { gap: spacing.xs },
});

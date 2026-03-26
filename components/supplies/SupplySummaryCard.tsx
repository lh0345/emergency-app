import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';
import type { SupplyCategory } from '@/types';

export function SupplySummaryCard({
  category,
  count,
  lowStock,
}: {
  category: SupplyCategory;
  count: number;
  lowStock: boolean;
}) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <AppText variant="subtitle">{category}</AppText>
        <AppText muted>{count} items</AppText>
      </View>
      {lowStock ? (
        <AppText style={styles.warn}>Review quantities — some may be low.</AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  warn: { marginTop: spacing.sm, color: '#f59e0b' },
});

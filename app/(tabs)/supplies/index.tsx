import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { SupplySummaryCard } from '@/components/supplies/SupplySummaryCard';
import { SupplyItemRow } from '@/components/supplies/SupplyItemRow';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { SUPPLY_CATEGORIES } from '@/constants/categories';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useSupplies } from '@/hooks/useSupplies';
import type { SupplyCategory } from '@/types';

export default function SuppliesListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { supplies, loading } = useSupplies();

  const byCategory = useMemo(() => {
    const map: Record<SupplyCategory, typeof supplies> = {
      Water: [],
      Food: [],
      Power: [],
      Medicine: [],
      Other: [],
    };
    for (const s of supplies) {
      const c = SUPPLY_CATEGORIES.includes(s.category as SupplyCategory)
        ? (s.category as SupplyCategory)
        : 'Other';
      map[c].push(s);
    }
    return map;
  }, [supplies]);

  if (!ready || error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.surface }]}>
        <AppText>{error ? 'DB error' : 'Loading…'}</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: spacing.lg }} />
      ) : (
        <FlatList
          data={supplies}
          keyExtractor={(s) => String(s.id)}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.md }}>
              {SUPPLY_CATEGORIES.map((cat) => {
                const list = byCategory[cat];
                const low = list.some((x) => x.quantity <= 1);
                return (
                  <SupplySummaryCard
                    key={cat}
                    category={cat}
                    count={list.length}
                    lowStock={low && list.length > 0}
                  />
                );
              })}
            </View>
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText muted style={{ marginTop: spacing.lg }}>
              No supplies tracked. Add water, food, and power items.
            </AppText>
          }
          renderItem={({ item }) => (
            <SupplyItemRow item={item} onPress={() => router.push(`/supplies/${item.id}`)} />
          )}
        />
      )}
      <View style={styles.footer}>
        <AppButton title="Add supply" onPress={() => router.push('/supplies/add')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.lg, paddingBottom: 120 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#33415555',
  },
});

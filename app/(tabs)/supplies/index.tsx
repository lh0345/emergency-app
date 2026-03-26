import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { SupplySummaryCard } from '@/components/supplies/SupplySummaryCard';
import { SupplyItemRow } from '@/components/supplies/SupplyItemRow';
import { FabAdd } from '@/components/ui/FabAdd';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { SUPPLY_CATEGORIES } from '@/constants/categories';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding, scrollBottomInsetAboveFooter } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useSupplies } from '@/hooks/useSupplies';
import type { SupplyCategory } from '@/types';

export default function SuppliesListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { supplies, loading, refresh } = useSupplies();

  useFocusEffect(
    useCallback(() => {
      if (ready && !error) void refresh({ silent: true });
    }, [ready, error, refresh])
  );

  const byCategory = useMemo(() => {
    const map: Record<SupplyCategory, typeof supplies> = {
      Water: [],
      Food: [],
      Power: [],
      Medicine: [],
      'Home resilience': [],
      'Food growing': [],
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

  const renderHeader = () => (
    <View>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.suppliesBanner,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.heroIconWrap, { backgroundColor: theme.suppliesMuted }]}>
          <Ionicons name="cube" size={22} color={theme.suppliesAccent} />
        </View>
        <AppText variant="title" style={[styles.heroTitle, { color: theme.text }]}>
          Supplies
        </AppText>
        <AppText muted variant="caption" style={styles.heroSub}>
          Track stock, targets, and daily use so “days left” stays meaningful during shortages.
        </AppText>
      </View>
      <AppText variant="label" style={[styles.sectionLabel, { color: theme.textMuted }]}>
        By category
      </AppText>
      <View style={styles.summaryBlock}>
        {SUPPLY_CATEGORIES.map((cat) => {
          const list = byCategory[cat];
          const low = list.some((x) => x.quantity <= 1);
          return (
            <SupplySummaryCard key={cat} category={cat} count={list.length} lowStock={low && list.length > 0} />
          );
        })}
      </View>
      <AppText variant="label" style={[styles.sectionLabel, { color: theme.textMuted, marginTop: spacing.sm }]}>
        All items
      </AppText>
    </View>
  );

  if (!ready || error) {
    return (
      <Screen>
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <AppText style={{ color: theme.text }}>{error ? 'Database error' : 'Loading…'}</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.root}>
        {loading ? (
          <ActivityIndicator color={theme.suppliesAccent} style={{ marginTop: spacing.xxl }} />
        ) : (
          <FlatList
            data={supplies}
            keyExtractor={(s) => String(s.id)}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SupplyItemRow item={item} onPress={() => router.push(`/supplies/${item.id}`)} />
            )}
          />
        )}
        <FabAdd
          color={theme.suppliesAccent}
          accessibilityLabel="Add supply"
          onPress={() => router.push('/supplies/add')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: { marginBottom: spacing.xs },
  heroSub: { lineHeight: 18 },
  sectionLabel: {
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  summaryBlock: { marginBottom: spacing.md },
  list: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: scrollBottomInsetAboveFooter,
  },
});

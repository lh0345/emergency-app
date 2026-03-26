import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { PlanCard } from '@/components/plans/PlanCard';
import { FabAdd } from '@/components/ui/FabAdd';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding, scrollBottomInsetAboveFooter } from '@/constants/layout';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { usePlans } from '@/hooks/usePlans';

export default function PlansListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { plans, loading, duplicatePlan, refresh } = usePlans();

  useFocusEffect(
    useCallback(() => {
      if (ready && !error) void refresh({ silent: true });
    }, [ready, error, refresh])
  );

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <AppText variant="title" style={{ color: theme.text }}>
        Plans
      </AppText>
      <AppText muted variant="caption" style={styles.headerSub}>
        From Prepare — your lists for outages, go-bags, and drills.
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
          <ActivityIndicator color={theme.plansAccent} style={{ marginTop: spacing.xxl }} />
        ) : (
          <FlatList
            data={plans}
            keyExtractor={(p) => String(p.id)}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PlanCard
                plan={item}
                onOpen={() => router.push(`/plans/${item.id}`)}
                onDuplicate={() => void duplicatePlan(item.id)}
              />
            )}
          />
        )}
        <FabAdd
          color={theme.plansAccent}
          accessibilityLabel="New plan"
          onPress={() => router.push('/plans/new')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBlock: { marginBottom: spacing.md },
  headerSub: { lineHeight: 18, marginTop: 2 },
  list: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: scrollBottomInsetAboveFooter,
  },
});

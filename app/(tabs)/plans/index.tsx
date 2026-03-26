import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { PlanCard } from '@/components/plans/PlanCard';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding, scrollBottomInsetAboveFooter } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { usePlans } from '@/hooks/usePlans';
import { useTabBarFooterPadding } from '@/hooks/useTabBarFooterPadding';

export default function PlansListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { plans, loading, duplicatePlan, refresh } = usePlans();
  const footerPad = useTabBarFooterPadding();

  useFocusEffect(
    useCallback(() => {
      if (ready && !error) void refresh({ silent: true });
    }, [ready, error, refresh])
  );

  const renderHeader = () => (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: theme.plansBanner,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.heroIconWrap, { backgroundColor: theme.plansMuted }]}>
        <Ionicons name="list-circle" size={24} color={theme.plansAccent} />
      </View>
      <AppText variant="title" style={[styles.heroTitle, { color: theme.text }]}>
        Preparedness plans
      </AppText>
      <AppText muted variant="caption" style={styles.heroSub}>
        One plan per scenario — evacuation, stay-home, reunions. Open to edit steps or duplicate to iterate.
      </AppText>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.plansMuted }]}>
        <Ionicons name="document-text-outline" size={28} color={theme.plansAccent} />
      </View>
      <AppText variant="subtitle" style={{ color: theme.text, textAlign: 'center', marginTop: spacing.md }}>
        No plans yet
      </AppText>
      <AppText muted variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 }}>
        Create a plan for your household — you can add checklist steps on the next screen.
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
            ListEmptyComponent={renderEmpty}
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
        <View
          style={[
            styles.footer,
            { borderTopColor: theme.border, backgroundColor: theme.surfaceElevated },
            footerPad,
          ]}
        >
          <AppButton title="New plan" onPress={() => router.push('/plans/new')} />
        </View>
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
  list: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: scrollBottomInsetAboveFooter,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { usePlans } from '@/hooks/usePlans';

export default function PlansListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { plans, loading, duplicatePlan } = usePlans();

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
          data={plans}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText muted style={{ marginTop: spacing.lg }}>
              No plans yet. Create one for your household.
            </AppText>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/plans/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <AppCard style={styles.card}>
                <AppText variant="subtitle">{item.title}</AppText>
                <AppText muted numberOfLines={2}>
                  {item.summary || item.type}
                </AppText>
                <View style={styles.row}>
                  <AppButton
                    title="Duplicate"
                    variant="secondary"
                    style={styles.smallBtn}
                    onPress={() => void duplicatePlan(item.id)}
                  />
                </View>
              </AppCard>
            </Pressable>
          )}
        />
      )}
      <View style={styles.footer}>
        <AppButton title="New plan" onPress={() => router.push('/plans/new')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.lg, paddingBottom: 120 },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  smallBtn: { flex: 1, minHeight: 44 },
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

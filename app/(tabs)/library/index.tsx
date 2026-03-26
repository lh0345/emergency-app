import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { GuideCard } from '@/components/library/GuideCard';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useGuides } from '@/hooks/useGuides';

export default function LibraryListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const [q, setQ] = useState('');
  const { guides, loading } = useGuides(q.trim() || undefined);

  if (!ready || error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.surface }]}>
        <AppText>{error ? 'DB error' : 'Loading…'}</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <View style={styles.search}>
        <AppInput
          value={q}
          onChangeText={setQ}
          placeholder="Search guides"
          accessibilityLabel="Search guides"
        />
      </View>
      {loading ? (
        <ActivityIndicator color={theme.accent} />
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(g) => String(g.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText muted style={{ marginTop: spacing.lg }}>
              No guides match.
            </AppText>
          }
          renderItem={({ item }) => (
            <GuideCard guide={item} onPress={() => router.push(`/library/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});

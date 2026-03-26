import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { GuideCard } from '@/components/library/GuideCard';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding, scrollBottomInsetAboveFooter } from '@/constants/layout';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useGuides } from '@/hooks/useGuides';

export default function LibraryListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const [q, setQ] = useState('');
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const { guides, loading, refresh } = useGuides(q.trim() || undefined, bookmarksOnly);

  useFocusEffect(
    useCallback(() => {
      if (ready && !error) void refresh({ silent: true });
    }, [ready, error, refresh])
  );

  const renderHeader = () => (
    <View>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.libraryBanner,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.heroIconWrap, { backgroundColor: theme.libraryMuted }]}>
          <Ionicons name="library" size={22} color={theme.libraryAccent} />
        </View>
        <AppText variant="title" style={[styles.heroTitle, { color: theme.text }]}>
          Guides
        </AppText>
        <AppText muted variant="caption" style={styles.heroSub}>
          Short reference guides for outages, evacuation, and safety. Search or filter to saved items.
        </AppText>
      </View>

      <View style={styles.searchRow}>
        <AppInput
          value={q}
          onChangeText={setQ}
          placeholder="Search guides"
          accessibilityLabel="Search guides"
          style={styles.searchInput}
          returnKeyType="search"
        />
        <Pressable
          onPress={() => setBookmarksOnly((v) => !v)}
          style={({ pressed }) => [
            styles.bookmarkBtn,
            {
              borderColor: bookmarksOnly ? theme.libraryAccent : theme.border,
              backgroundColor: bookmarksOnly ? theme.libraryMuted : theme.surfaceElevated,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={bookmarksOnly ? 'Show all guides' : 'Show bookmarked guides only'}
          accessibilityState={{ selected: bookmarksOnly }}
        >
          <Ionicons
            name={bookmarksOnly ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={bookmarksOnly ? theme.libraryAccent : theme.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.libraryMuted }]}>
        <Ionicons name="search-outline" size={28} color={theme.libraryAccent} />
      </View>
      <AppText variant="subtitle" style={{ color: theme.text, textAlign: 'center', marginTop: spacing.md }}>
        {bookmarksOnly ? 'No saved guides' : 'No guides match'}
      </AppText>
      <AppText muted variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 }}>
        {bookmarksOnly
          ? 'Bookmark guides from a guide’s page to find them here.'
          : 'Try different words, or clear the search.'}
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
          <View style={styles.loadingWrap}>
            {renderHeader()}
            <ActivityIndicator color={theme.libraryAccent} style={{ marginTop: spacing.lg }} />
          </View>
        ) : (
          <FlatList
            data={guides}
            keyExtractor={(g) => String(g.id)}
            contentContainerStyle={styles.list}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <GuideCard guide={item} onPress={() => router.push(`/library/${item.id}`)} />
            )}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingWrap: { flex: 1 },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1 },
  bookmarkBtn: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
});

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { GuideStep } from '@/components/library/GuideStep';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import type { GuideRow, GuideStep as GuideStepType } from '@/types';

export default function GuideDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { db, ready } = useDatabase();

  const [guide, setGuide] = useState<GuideRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedGuides, setRelatedGuides] = useState<GuideRow[]>([]);

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setGuide(null);
      setLoading(false);
      return;
    }
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const g = await Q.getGuide(db, id);
    setGuide(g);
    setLoading(false);
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      if (ready && db) void load();
    }, [ready, db, load])
  );

  useEffect(() => {
    let cancelled = false;
    if (!db || !guide) {
      setRelatedGuides([]);
      return () => {
        cancelled = true;
      };
    }
    let topics: string[] = [];
    try {
      topics = JSON.parse(guide.relatedTopicsJson) as string[];
    } catch {
      topics = [];
    }
    if (topics.length === 0) {
      setRelatedGuides([]);
      return () => {
        cancelled = true;
      };
    }
    void (async () => {
      const rows = await Q.getGuidesBySlugs(db, topics);
      if (!cancelled) setRelatedGuides(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [db, guide]);

  const toggleBookmark = async () => {
    if (!guide || !db) return;
    await Q.setGuideBookmarked(db, guide.id, !guide.bookmarked);
    await load();
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <Screen back title="Guide">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <AppText style={{ color: theme.text }}>Invalid guide.</AppText>
          <AppButton title="Go back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen back title="Guide">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <ActivityIndicator color={theme.libraryAccent} />
        </View>
      </Screen>
    );
  }

  if (!guide) {
    return (
      <Screen back title="Guide">
        <View style={[styles.center, { backgroundColor: theme.surface, padding: spacing.lg }]}>
          <AppText variant="subtitle" style={{ color: theme.text, textAlign: 'center' }}>
            Guide not found.
          </AppText>
          <AppButton title="Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  let steps: GuideStepType[] = [];
  let supplies: string[] = [];
  let mistakes: string[] = [];
  let tags: string[] = [];
  try {
    tags = JSON.parse(guide.tagsJson) as string[];
  } catch {
    tags = [];
  }
  try {
    steps = JSON.parse(guide.stepsJson) as GuideStepType[];
  } catch {
    steps = [];
  }
  try {
    supplies = JSON.parse(guide.suppliesJson) as string[];
  } catch {
    supplies = [];
  }
  try {
    mistakes = JSON.parse(guide.mistakesJson) as string[];
  } catch {
    mistakes = [];
  }

  return (
    <Screen back title={guide.title}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: theme.surface }]}
        showsVerticalScrollIndicator={false}
      >
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.libraryBanner,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <View style={[styles.heroIcon, { backgroundColor: theme.libraryMuted }]}>
            <Ionicons name="book" size={22} color={theme.libraryAccent} />
          </View>
          <View style={[styles.catPill, { backgroundColor: theme.libraryMuted }]}>
            <AppText variant="caption" style={{ color: theme.libraryAccent, fontWeight: '700' }}>
              {guide.category}
            </AppText>
          </View>
        </View>
        <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.sm }}>
          {guide.title}
        </AppText>
        <AppText style={{ color: theme.text, lineHeight: 24 }}>{guide.overview}</AppText>
        <View style={styles.tagRow}>
          {tags.map((t) => (
            <View key={t} style={[styles.tagPill, { backgroundColor: theme.libraryMuted }]}>
              <AppText variant="caption" style={{ color: theme.libraryAccent, fontSize: 12, fontWeight: '600' }}>
                {t}
              </AppText>
            </View>
          ))}
          <AppText variant="caption" style={{ color: theme.textMuted }}>
            {guide.readingTime} min read
            {guide.offlineReady ? ' · Offline-ready' : ''}
          </AppText>
        </View>
      </View>

      <Pressable
        onPress={() => void toggleBookmark()}
        style={({ pressed }) => [
          styles.bookmarkRow,
          {
            borderColor: guide.bookmarked ? theme.libraryAccent : theme.border,
            backgroundColor: guide.bookmarked ? theme.libraryMuted : theme.surfaceElevated,
            opacity: pressed ? 0.92 : 1,
            minHeight: minTouchTarget,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={guide.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        accessibilityState={{ selected: !!guide.bookmarked }}
      >
        <Ionicons
          name={guide.bookmarked ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={theme.libraryAccent}
        />
        <AppText style={{ color: theme.text, fontWeight: '600', marginLeft: spacing.sm }}>
          {guide.bookmarked ? 'Saved — tap to remove' : 'Save to bookmarks'}
        </AppText>
      </Pressable>

      <AppText variant="title" style={[styles.sectionTitle, { color: theme.text }]}>
        Steps
      </AppText>
      {steps.map((s, i) => (
        <GuideStep key={`${i}-${s.title}`} step={s} index={i} />
      ))}

      {relatedGuides.filter((g) => g.id !== guide.id).length > 0 ? (
        <>
          <AppText variant="title" style={[styles.sectionTitle, { color: theme.text }]}>
            Related guides
          </AppText>
          {relatedGuides
            .filter((g) => g.id !== guide.id)
            .map((g) => (
            <Pressable
              key={g.id}
              onPress={() => router.push(`/library/${g.id}`)}
              style={({ pressed }) => [
                styles.relatedRow,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceElevated,
                  opacity: pressed ? 0.9 : 1,
                  minHeight: minTouchTarget,
                },
              ]}
              accessibilityRole="button"
            >
              <AppText style={{ color: theme.text, flex: 1 }}>{g.title}</AppText>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </Pressable>
          ))}
        </>
      ) : null}

      {supplies.length > 0 ? (
        <>
          <AppText variant="title" style={[styles.sectionTitle, { color: theme.text }]}>
            What you need
          </AppText>
          <AppCard
            style={[
              styles.block,
              {
                borderRadius: radius.lg,
                borderLeftWidth: 4,
                borderLeftColor: theme.libraryAccent,
              },
            ]}
          >
            {supplies.map((s) => (
              <View key={s} style={styles.listRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.libraryAccent} />
                <AppText style={[styles.listText, { color: theme.text }]}>{s}</AppText>
              </View>
            ))}
          </AppCard>
        </>
      ) : null}

      {mistakes.length > 0 ? (
        <>
          <AppText variant="title" style={[styles.sectionTitle, { color: theme.text }]}>
            Common mistakes
          </AppText>
          <AppCard
            style={[
              styles.block,
              {
                borderRadius: radius.lg,
                borderLeftWidth: 4,
                borderLeftColor: theme.warning,
              },
            ]}
          >
            {mistakes.map((s) => (
              <View key={s} style={styles.listRow}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.warning} />
                <AppText style={[styles.listText, { color: theme.text }]}>{s}</AppText>
              </View>
            ))}
          </AppCard>
        </>
      ) : null}

      <AppText variant="title" style={[styles.sectionTitle, { color: theme.text }]}>
        Safety
      </AppText>
      <AppCard
        style={[
          styles.block,
          styles.safetyCard,
          {
            borderRadius: radius.lg,
            borderLeftWidth: 4,
            borderLeftColor: theme.success,
          },
        ]}
      >
        <AppText style={{ color: theme.text, lineHeight: 24 }}>{guide.safetyNote}</AppText>
      </AppCard>

      <AppButton title="Back" variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  scroll: { paddingHorizontal: screenPadding, paddingBottom: spacing.xl },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tagPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: { marginBottom: spacing.md, marginTop: spacing.sm },
  block: { marginBottom: spacing.lg, paddingVertical: spacing.sm },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  listText: { flex: 1, lineHeight: 24, fontSize: 16 },
  safetyCard: { marginBottom: spacing.lg },
  backBtn: { marginTop: spacing.md },
});

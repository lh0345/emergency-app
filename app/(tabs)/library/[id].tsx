import { Ionicons } from '@expo/vector-icons';
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

  const load = useCallback(async () => {
    if (!db || !Number.isFinite(id)) return;
    setLoading(true);
    const g = await Q.getGuide(db, id);
    setGuide(g);
    setLoading(false);
  }, [db, id]);

  useEffect(() => {
    if (ready && db) void load();
  }, [ready, db, load]);

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

  if (loading || !guide) {
    return (
      <Screen back title="Guide">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <ActivityIndicator color={theme.libraryAccent} />
        </View>
      </Screen>
    );
  }

  let steps: GuideStepType[] = [];
  let supplies: string[] = [];
  let mistakes: string[] = [];
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
            <Ionicons name="book" size={28} color={theme.libraryAccent} />
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
  scroll: { paddingHorizontal: screenPadding, paddingBottom: spacing.xxl },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
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

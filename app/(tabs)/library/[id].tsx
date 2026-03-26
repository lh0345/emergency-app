import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { GuideStep } from '@/components/library/GuideStep';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
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
      <View style={styles.center}>
        <AppText>Invalid guide.</AppText>
      </View>
    );
  }

  if (loading || !guide) {
    return (
      <View style={[styles.center, { backgroundColor: theme.surface }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
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
    <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: theme.surface }]}>
      <AppText variant="title" style={{ color: theme.text }}>
        {guide.title}
      </AppText>
      <AppText muted style={{ marginBottom: spacing.md }}>
        {guide.category}
      </AppText>
      <AppText style={{ marginBottom: spacing.lg }}>{guide.overview}</AppText>

      <AppButton
        title={guide.bookmarked ? 'Remove bookmark' : 'Bookmark'}
        variant="secondary"
        onPress={() => void toggleBookmark()}
      />

      <AppText variant="title" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        Steps
      </AppText>
      {steps.map((s, i) => (
        <GuideStep key={`${i}-${s.title}`} step={s} index={i} />
      ))}

      <AppText variant="title" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        What you need
      </AppText>
      {supplies.map((s) => (
        <AppText key={s} style={styles.bullet}>
          • {s}
        </AppText>
      ))}

      <AppText variant="title" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        Common mistakes
      </AppText>
      {mistakes.map((s) => (
        <AppText key={s} style={styles.bullet}>
          • {s}
        </AppText>
      ))}

      <AppText variant="title" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        Safety
      </AppText>
      <AppText style={{ marginBottom: spacing.xxl }}>{guide.safetyNote}</AppText>

      <AppButton title="Back" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg },
  bullet: { marginBottom: spacing.xs, lineHeight: 22 },
});

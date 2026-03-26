import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { EmergencyChecklistItem } from '@/components/emergency/EmergencyChecklistItem';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { pickChecklistLinesForScenario } from '@/constants/scenarios';
import * as Q from '@/db/queries';
import { useEmergencySessionStore } from '@/store/emergencySessionStore';
import type { ChecklistItemRow } from '@/types';

export default function EmergencyChecklistScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { db, ready } = useDatabase();
  const sessionId = useEmergencySessionStore((s) => s.sessionId);
  const scenarioId = useEmergencySessionStore((s) => s.scenarioId);
  const answers = useEmergencySessionStore((s) => s.answers);
  const actions = useEmergencySessionStore((s) => s.actions);
  const reset = useEmergencySessionStore((s) => s.reset);

  const [items, setItems] = useState<ChecklistItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!db || !sessionId) {
      setLoading(false);
      return;
    }
    let rows = await Q.listChecklistItems(db, 'emergency', sessionId);
    const fallbackLines = scenarioId
      ? pickChecklistLinesForScenario(scenarioId, answers)
      : actions;
    if (rows.length === 0 && fallbackLines.length) {
      await Q.replaceEmergencyChecklist(db, sessionId, fallbackLines);
      rows = await Q.listChecklistItems(db, 'emergency', sessionId);
    }
    setItems(rows);
    setLoading(false);
  }, [db, sessionId, actions, scenarioId, answers]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  const doneCount = useMemo(() => items.filter((i) => i.done).length, [items]);
  const total = items.length;

  const toggle = async (id: number, done: boolean) => {
    if (!db) return;
    await Q.setChecklistItemDone(db, id, !done);
    await load();
  };

  const finish = () => {
    reset();
    router.replace('/');
  };

  if (!sessionId) {
    return (
      <Screen variant="modal" back title="Checklist">
        <View style={styles.empty}>
          <AppText variant="subtitle" style={{ color: theme.text }}>
            No active checklist.
          </AppText>
          <AppButton title="Home" onPress={() => router.replace('/')} style={styles.emptyBtn} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen variant="modal" back title="Checklist">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.emergencyBanner,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: theme.emergencyMuted }]}>
              <Ionicons name="checkbox-outline" size={20} color={theme.accent} />
            </View>
            {!loading && total > 0 ? (
              <View style={[styles.pill, { backgroundColor: theme.emergencyMuted }]}>
                <AppText variant="label" style={{ color: theme.accent, fontSize: 13 }}>
                  {doneCount} of {total} done
                </AppText>
              </View>
            ) : null}
          </View>
          <AppText variant="title" style={[styles.heroTitle, { color: theme.text }]}>
            Your checklist
          </AppText>
          <AppText muted variant="caption" style={styles.heroSub}>
            Tap each line when you have completed it. You can return home when you are finished.
          </AppText>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.accent} style={styles.loader} />
        ) : (
          items.map((it) => (
            <EmergencyChecklistItem
              key={it.id}
              item={it}
              onToggle={() => void toggle(it.id, !!it.done)}
            />
          ))
        )}
        <AppButton title="Done — return home" onPress={finish} style={styles.done} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  empty: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  emptyBtn: { marginTop: spacing.md },
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
    marginBottom: spacing.sm,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  heroTitle: { marginBottom: spacing.xs },
  heroSub: { lineHeight: 18 },
  loader: { marginVertical: spacing.lg },
  done: { marginTop: spacing.sm },
});

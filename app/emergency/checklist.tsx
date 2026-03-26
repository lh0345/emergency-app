import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmergencyChecklistItem } from '@/components/emergency/EmergencyChecklistItem';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import { useEmergencySessionStore } from '@/store/emergencySessionStore';
import type { ChecklistItemRow } from '@/types';

export default function EmergencyChecklistScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { db, ready } = useDatabase();
  const sessionId = useEmergencySessionStore((s) => s.sessionId);
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
    if (rows.length === 0 && actions.length) {
      await Q.replaceEmergencyChecklist(db, sessionId, actions);
      rows = await Q.listChecklistItems(db, 'emergency', sessionId);
    }
    setItems(rows);
    setLoading(false);
  }, [db, sessionId, actions]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

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
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }]}>
        <AppText>No active checklist.</AppText>
        <AppButton title="Home" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.sm }}>
          Checklist
        </AppText>
        <AppText muted style={{ marginBottom: spacing.lg }}>
          Tap an item when done.
        </AppText>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  done: { marginTop: spacing.lg },
});

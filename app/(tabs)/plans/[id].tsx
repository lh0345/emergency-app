import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import type { ChecklistItemRow, PlanRow } from '@/types';

export default function PlanDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { db, ready } = useDatabase();

  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [items, setItems] = useState<ChecklistItemRow[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [summary, setSummary] = useState('');
  const [newLine, setNewLine] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!db || !Number.isFinite(id)) return;
    setLoading(true);
    const p = await Q.getPlan(db, id);
    setPlan(p);
    if (p) {
      setTitle(p.title);
      setType(p.type);
      setSummary(p.summary);
    }
    const lines = await Q.listChecklistItems(db, 'plan', String(id));
    setItems(lines);
    setLoading(false);
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      if (ready && db) void load();
    }, [ready, db, load])
  );

  const saveMeta = async () => {
    if (!db || !plan) return;
    await Q.updatePlan(db, id, { title: title.trim(), type: type.trim(), summary: summary.trim() });
    await load();
  };

  const addItem = async () => {
    if (!db || !newLine.trim()) return;
    await Q.insertChecklistItem(db, {
      contextType: 'plan',
      contextId: String(id),
      text: newLine.trim(),
      orderIndex: items.length,
    });
    setNewLine('');
    await load();
  };

  const toggleItem = async (item: ChecklistItemRow) => {
    if (!db) return;
    await Q.setChecklistItemDone(db, item.id, !item.done);
    await load();
  };

  const deletePlan = () => {
    Alert.alert('Delete plan?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!db) return;
          await Q.deletePlan(db, id);
          router.back();
        },
      },
    ]);
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <View style={styles.center}>
        <AppText>Invalid plan.</AppText>
      </View>
    );
  }

  if (loading || !plan) {
    return (
      <View style={[styles.center, { backgroundColor: theme.surface }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="label">Title</AppText>
        <AppInput value={title} onChangeText={setTitle} />
        <AppText variant="label" style={styles.label}>
          Type
        </AppText>
        <AppInput value={type} onChangeText={setType} />
        <AppText variant="label" style={styles.label}>
          Summary
        </AppText>
        <AppInput
          value={summary}
          onChangeText={setSummary}
          multiline
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
        <AppButton title="Save changes" variant="secondary" onPress={() => void saveMeta()} />

        <AppText variant="title" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Checklist
        </AppText>
        {items.map((it) => (
          <AppCheckbox
            key={it.id}
            checked={!!it.done}
            label={it.text}
            onToggle={() => void toggleItem(it)}
          />
        ))}

        <AppText variant="label" style={styles.label}>
          Add step
        </AppText>
        <AppInput value={newLine} onChangeText={setNewLine} placeholder="Next step" />
        <AppButton title="Add step" variant="secondary" onPress={() => void addItem()} />

        <AppButton title="Delete plan" variant="ghost" onPress={deletePlan} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
});

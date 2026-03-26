import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { Screen } from '@/components/ui/Screen';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import { useContacts } from '@/hooks/useContacts';
import type { ChecklistItemRow, PlanRow } from '@/types';

export default function PlanDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { db, ready } = useDatabase();
  const { contacts } = useContacts();

  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [items, setItems] = useState<ChecklistItemRow[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [summary, setSummary] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [suppliesNeededText, setSuppliesNeededText] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [newLine, setNewLine] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setPlan(null);
      setItems([]);
      setLoading(false);
      return;
    }
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const p = await Q.getPlan(db, id);
    setPlan(p);
    if (p) {
      setTitle(p.title);
      setType(p.type);
      setSummary(p.summary);
      setPlanNotes(p.planNotes ?? '');
      setReviewDate(p.reviewDate ?? '');
      try {
        const arr = JSON.parse(p.suppliesNeededJson) as string[];
        setSuppliesNeededText(Array.isArray(arr) ? arr.join('\n') : '');
      } catch {
        setSuppliesNeededText('');
      }
      try {
        const ids = JSON.parse(p.contactIdsJson) as number[];
        setSelectedContactIds(Array.isArray(ids) ? ids : []);
      } catch {
        setSelectedContactIds([]);
      }
    } else {
      setItems([]);
    }
    const lines = p ? await Q.listChecklistItems(db, 'plan', String(id)) : [];
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
    const suppliesLines = suppliesNeededText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    await Q.updatePlan(db, id, {
      title: title.trim(),
      type: type.trim(),
      summary: summary.trim(),
      planNotes: planNotes.trim(),
      reviewDate: reviewDate.trim() || null,
      suppliesNeededJson: JSON.stringify(suppliesLines),
      contactIdsJson: JSON.stringify(selectedContactIds),
    });
    await load();
  };

  const toggleContactId = (cid: number) => {
    setSelectedContactIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
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
      <Screen back title="Plan">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <AppText style={{ color: theme.text }}>Invalid plan.</AppText>
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen back title="Plan">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <ActivityIndicator color={theme.plansAccent} />
        </View>
      </Screen>
    );
  }

  if (!plan) {
    return (
      <Screen back title="Plan">
        <View style={[styles.center, { backgroundColor: theme.surface, padding: spacing.lg }]}>
          <AppText variant="subtitle" style={{ color: theme.text, textAlign: 'center' }}>
            Plan not found. It may have been deleted.
          </AppText>
          <AppButton title="Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen back title={title.trim() || 'Plan'}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.surface }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.plansBanner,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.heroIcon, { backgroundColor: theme.plansMuted }]}>
              <Ionicons name="map-outline" size={22} color={theme.plansAccent} />
            </View>
            <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.xs }}>
              {title.trim() || 'Plan'}
            </AppText>
            <AppText muted variant="caption" style={{ lineHeight: 20 }}>
              Edit the summary, then work through your checklist. Add steps as you think of them.
            </AppText>
          </View>

          <AppCard
            style={[
              styles.block,
              {
                borderRadius: radius.lg,
                borderLeftWidth: 4,
                borderLeftColor: theme.plansAccent,
              },
            ]}
          >
            <AppText variant="label" style={[styles.sectionTag, { color: theme.plansAccent }]}>
              Plan details
            </AppText>
            <AppText variant="label" style={{ color: theme.text, marginTop: spacing.sm }}>
              Title
            </AppText>
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
          </AppCard>

          <AppCard
            style={[
              styles.block,
              {
                borderRadius: radius.lg,
                borderLeftWidth: 4,
                borderLeftColor: theme.plansAccent,
              },
            ]}
          >
            <AppText variant="label" style={[styles.sectionTag, { color: theme.plansAccent }]}>
              Planning details
            </AppText>
            <AppText variant="label" style={{ color: theme.text, marginTop: spacing.sm }}>
              Notes
            </AppText>
            <AppInput
              value={planNotes}
              onChangeText={setPlanNotes}
              multiline
              placeholder="Context, constraints, who owns this plan"
              style={{ minHeight: 72, textAlignVertical: 'top' }}
            />
            <AppText variant="label" style={styles.label}>
              Review date (YYYY-MM-DD)
            </AppText>
            <AppInput value={reviewDate} onChangeText={setReviewDate} placeholder="Optional" />
            <AppText variant="label" style={styles.label}>
              Supplies needed (one per line)
            </AppText>
            <AppInput
              value={suppliesNeededText}
              onChangeText={setSuppliesNeededText}
              multiline
              placeholder={'Water containers\nBattery radio'}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
            <AppText variant="label" style={styles.label}>
              Contacts for this plan
            </AppText>
            {contacts.length === 0 ? (
              <AppText muted variant="caption">
                Add contacts in the Contacts tab to link them here.
              </AppText>
            ) : (
              contacts.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => toggleContactId(c.id)}
                  style={({ pressed }) => [
                    styles.contactPick,
                    {
                      borderColor: selectedContactIds.includes(c.id) ? theme.plansAccent : theme.border,
                      backgroundColor: selectedContactIds.includes(c.id) ? theme.plansMuted : theme.surface,
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selectedContactIds.includes(c.id) }}
                >
                  <AppText style={{ color: theme.text, flex: 1 }}>{c.name}</AppText>
                  <AppText variant="caption" style={{ color: theme.textMuted }}>
                    {selectedContactIds.includes(c.id) ? 'Selected' : 'Tap'}
                  </AppText>
                </Pressable>
              ))
            )}
            <AppButton title="Save planning details" variant="secondary" onPress={() => void saveMeta()} />
          </AppCard>

          <AppText variant="title" style={[styles.sectionHeading, { color: theme.text }]}>
            Checklist
          </AppText>
          <AppCard
            style={[
              styles.block,
              {
                borderRadius: radius.lg,
                borderLeftWidth: 4,
                borderLeftColor: theme.plansAccent,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            {items.length === 0 ? (
              <AppText muted style={{ marginBottom: spacing.sm }}>
                No steps yet. Add one below.
              </AppText>
            ) : null}
            {items.map((it) => (
              <View key={it.id} style={{ marginBottom: spacing.sm }}>
                <AppCheckbox
                  checked={!!it.done}
                  label={it.text}
                  accentColor={theme.plansAccent}
                  onToggle={() => void toggleItem(it)}
                />
              </View>
            ))}
          </AppCard>

          <AppCard
            style={[
              styles.block,
              {
                borderRadius: radius.lg,
                borderLeftWidth: 4,
                borderLeftColor: theme.border,
              },
            ]}
          >
            <AppText variant="label" style={{ color: theme.text }}>
              Add step
            </AppText>
            <AppInput value={newLine} onChangeText={setNewLine} placeholder="e.g. Grab go-bag" />
            <AppButton title="Add step" variant="secondary" onPress={() => void addItem()} />
          </AppCard>

          <AppButton title="Delete plan" variant="ghost" onPress={deletePlan} style={{ marginTop: spacing.lg }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: screenPadding, paddingBottom: spacing.xxl },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  block: { marginBottom: spacing.md },
  sectionTag: { letterSpacing: 0.4, marginBottom: spacing.xs },
  sectionHeading: { marginTop: spacing.xs, marginBottom: spacing.sm },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
  contactPick: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
});

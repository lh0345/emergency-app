import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ActionStepCard } from '@/components/emergency/ActionStepCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { getScenarioById } from '@/constants/scenarios';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import { useEmergencySessionStore } from '@/store/emergencySessionStore';

type Step = 'questions' | 'actions';

export default function EmergencyScenarioScreen() {
  const { scenario: raw } = useLocalSearchParams<{ scenario: string }>();
  const scenarioId = Array.isArray(raw) ? raw[0] : raw;
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { db } = useDatabase();

  const scenario = useMemo(() => (scenarioId ? getScenarioById(scenarioId) : undefined), [scenarioId]);
  const answers = useEmergencySessionStore((s) => s.answers);
  const sessionId = useEmergencySessionStore((s) => s.sessionId);
  const actions = useEmergencySessionStore((s) => s.actions);
  const setAnswer = useEmergencySessionStore((s) => s.setAnswer);
  const computeActions = useEmergencySessionStore((s) => s.computeActions);

  const [step, setStep] = useState<Step>('questions');

  if (!scenario) {
    return (
      <Screen variant="modal" back title="Emergency">
        <View style={styles.empty}>
          <AppText variant="subtitle" style={{ color: theme.text }}>
            Scenario not found.
          </AppText>
          <AppButton title="Go back" onPress={() => router.back()} style={styles.emptyBtn} />
        </View>
      </Screen>
    );
  }

  const allAnswered =
    scenario.questions.length === 0 ||
    scenario.questions.every((q) => answers[q.id] !== undefined);

  const goToChecklist = async () => {
    if (!db || !sessionId) {
      router.push('/emergency/checklist');
      return;
    }
    const lines = actions.length ? actions : [];
    await Q.replaceEmergencyChecklist(db, sessionId, lines);
    router.push('/emergency/checklist');
  };

  const qCount = scenario.questions.length;

  return (
    <Screen variant="modal" back title={scenario.title}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={[styles.titleIcon, { backgroundColor: theme.emergencyMuted }]}>
            <Ionicons name="reader-outline" size={22} color={theme.accent} />
          </View>
          <View style={styles.titleText}>
            <AppText variant="title" style={{ color: theme.text }}>
              {scenario.title}
            </AppText>
            {step === 'questions' && qCount > 0 ? (
              <AppText muted variant="caption" style={styles.stepHint}>
                Answer {qCount === 1 ? '1 question' : `${qCount} quick questions`} to tailor steps.
              </AppText>
            ) : step === 'questions' && qCount === 0 ? (
              <AppText muted variant="caption" style={styles.stepHint}>
                Tap below to see your top actions for this situation.
              </AppText>
            ) : step === 'actions' ? (
              <AppText muted variant="caption" style={styles.stepHint}>
                Prioritized actions — do these first when safe.
              </AppText>
            ) : null}
        </View>
        </View>

        {step === 'questions' ? (
          <>
            {scenario.questions.map((q, qi) => (
              <AppCard
                key={q.id}
                style={[
                  styles.qCard,
                  {
                    borderRadius: radius.lg,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.accent,
                  },
                ]}
              >
                {qCount > 1 ? (
                  <AppText variant="label" style={[styles.qMeta, { color: theme.accent }]}>
                    Question {qi + 1} of {qCount}
                  </AppText>
                ) : null}
                <AppText variant="subtitle" style={{ color: theme.text, marginBottom: spacing.md }}>
                  {q.prompt}
                </AppText>
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setAnswer(q.id, opt.id)}
                      style={({ pressed }) => [
                        styles.option,
                        {
                          minHeight: minTouchTarget,
                          borderColor: selected ? theme.accent : theme.border,
                          backgroundColor: selected ? theme.emergencyMuted : theme.surface,
                          opacity: pressed ? 0.92 : 1,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          { borderColor: selected ? theme.accent : theme.textMuted },
                        ]}
                      >
                        {selected ? (
                          <View style={[styles.radioInner, { backgroundColor: theme.accent }]} />
                        ) : null}
                      </View>
                      <AppText style={{ flex: 1, color: theme.text }}>{opt.label}</AppText>
                    </Pressable>
                  );
                })}
              </AppCard>
            ))}
            <AppButton
              title="See top actions"
              disabled={!allAnswered}
              onPress={() => {
                computeActions();
                setStep('actions');
              }}
            />
          </>
        ) : (
          <>
            <View style={styles.actionsHeader}>
              <Ionicons name="list-circle-outline" size={24} color={theme.accent} />
              <AppText variant="subtitle" style={{ color: theme.text, marginLeft: spacing.sm, flex: 1 }}>
                Top actions
              </AppText>
            </View>
            {actions.map((a, i) => (
              <ActionStepCard key={`${i}-${a}`} index={i} text={a} />
            ))}
            <AppButton title="Open checklist" onPress={() => void goToChecklist()} />
            <AppButton title="Back to questions" variant="ghost" onPress={() => setStep('questions')} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  empty: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  emptyBtn: { marginTop: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xl, gap: spacing.md },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: { flex: 1, minWidth: 0 },
  stepHint: { marginTop: spacing.xs, lineHeight: 18 },
  qCard: { marginBottom: spacing.lg },
  qMeta: { marginBottom: spacing.sm, letterSpacing: 0.4 },
  option: {
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionStepCard } from '@/components/emergency/ActionStepCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { getScenarioById } from '@/constants/scenarios';
import { spacing } from '@/constants/spacing';
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
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }]}>
        <AppText>Scenario not found.</AppText>
        <AppButton title="Back" onPress={() => router.back()} />
      </SafeAreaView>
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="title" style={{ color: theme.text }}>
          {scenario.title}
        </AppText>

        {step === 'questions' ? (
          <>
            {scenario.questions.map((q) => (
              <View key={q.id} style={styles.block}>
                <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>
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
                          borderColor: selected ? theme.accent : theme.border,
                          backgroundColor: selected ? theme.surfaceElevated : 'transparent',
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <AppText>{opt.label}</AppText>
                    </Pressable>
                  );
                })}
              </View>
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
            <AppText variant="subtitle" style={{ marginBottom: spacing.md, marginTop: spacing.sm }}>
              Top actions
            </AppText>
            {actions.map((a, i) => (
              <ActionStepCard key={`${i}-${a}`} index={i} text={a} />
            ))}
            <AppButton title="Open checklist" onPress={() => void goToChecklist()} />
            <AppButton title="Back to questions" variant="ghost" onPress={() => setStep('questions')} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  block: { marginBottom: spacing.xl },
  option: {
    borderWidth: 2,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
});

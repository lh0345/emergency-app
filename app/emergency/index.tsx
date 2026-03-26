import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScenarioCard } from '@/components/emergency/ScenarioCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { SCENARIOS } from '@/constants/scenarios';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useEmergencySessionStore } from '@/store/emergencySessionStore';

export default function EmergencyIndexScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const startScenario = useEmergencySessionStore((s) => s.startScenario);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.sm }}>
          What is happening?
        </AppText>
        <AppText muted style={{ marginBottom: spacing.lg }}>
          Pick one. Short steps next.
        </AppText>
        {SCENARIOS.map((s) => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            onPress={() => {
              startScenario(s.id);
              router.push(`/emergency/${s.id}`);
            }}
          />
        ))}
        <AppButton
          title="Close"
          variant="secondary"
          onPress={() => router.back()}
          style={styles.close}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  close: { marginTop: spacing.lg },
});

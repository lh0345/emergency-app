import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScenarioCard } from '@/components/emergency/ScenarioCard';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
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
    <Screen variant="modal">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <AppText variant="title" style={{ color: theme.text }}>What&apos;s happening?</AppText>
          <AppText muted variant="caption" style={styles.introSub}>
            Choose the closest situation. You can refine with a few questions next.
          </AppText>
        </View>

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
          title="Close emergency mode"
          variant="secondary"
          onPress={() => router.back()}
          style={styles.close}
        />
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
  intro: { marginBottom: spacing.md },
  introSub: { lineHeight: 18, marginTop: 4 },
  close: { marginTop: spacing.sm },
});

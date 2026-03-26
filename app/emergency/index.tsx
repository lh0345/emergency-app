import { Ionicons } from '@expo/vector-icons';
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
import { radius, spacing } from '@/constants/spacing';
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
        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.emergencyBanner,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={[styles.heroIconWrap, { backgroundColor: theme.emergencyMuted }]}>
            <Ionicons name="shield-checkmark" size={22} color={theme.accent} />
          </View>
          <AppText variant="title" style={[styles.heroTitle, { color: theme.text }]}>
            What is happening?
          </AppText>
          <AppText muted variant="caption" style={styles.heroSub}>
            Pick what matches — outages, shortages, or safety. Short questions tailor steps and your checklist.
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
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: { marginBottom: spacing.xs },
  heroSub: { lineHeight: 18 },
  close: { marginTop: spacing.sm },
});

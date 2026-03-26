import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScenarioCard } from '@/components/emergency/ScenarioCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getThemeColors } from '@/constants/Colors';
import { SCENARIOS } from '@/constants/scenarios';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useEmergencyMode } from '@/hooks/useEmergencyMode';
import { emergencyCopy } from '@/utils/emergencyText';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { offline, unknown } = useOfflineStatus();
  const { openEmergencyHome, openScenario } = useEmergencyMode();
  const router = useRouter();

  const scenarios = SCENARIOS.slice(0, 6);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <AppText variant="title" style={{ color: theme.text }}>
            Emergency
          </AppText>
          <View style={styles.badges}>
            {offline || unknown ? (
              <AppBadge text={unknown ? 'Network unknown' : emergencyCopy.offline} tone="warning" />
            ) : null}
          </View>
          <AppText muted style={styles.sub}>
            {emergencyCopy.savedOnDevice}
          </AppText>
        </View>

        <AppButton
          title={emergencyCopy.emergencyMode}
          onPress={openEmergencyHome}
          style={styles.cta}
          accessibilityLabel={emergencyCopy.emergencyMode}
        />

        <SectionTitle>Scenarios</SectionTitle>
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} onPress={() => openScenario(s.id)} />
        ))}

        <SectionTitle>Quick open</SectionTitle>
        <View style={styles.quick}>
          {(
            [
              ['Plans', '/plans'],
              ['Supplies', '/supplies'],
              ['Library', '/library'],
              ['Contacts', '/contacts'],
            ] as const
          ).map(([label, href]) => (
            <Pressable
              key={href}
              onPress={() => router.push(href)}
              style={({ pressed }) => [
                styles.quickBtn,
                { borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Open ${label}`}
            >
              <AppText variant="label">{label}</AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  sub: { marginTop: spacing.xs },
  cta: { marginBottom: spacing.xl },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
  },
});

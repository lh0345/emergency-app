import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useEmergencyMode } from '@/hooks/useEmergencyMode';
import { useHouseholdProfile } from '@/hooks/useHouseholdProfile';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useSettings } from '@/hooks/useSettings';
import { useSupplies } from '@/hooks/useSupplies';
import {
  computeRiskLevel,
  estimateFoodDays,
  estimateWaterDays,
  formatDaysLabel,
  medicineAlertCount,
  nextRecommendedAction,
  powerReadinessScore,
} from '@/utils/resilienceMetrics';

/** Short readiness label — avoids vague "risk" jargon on Home. */
function readinessShortLabel(level: ReturnType<typeof computeRiskLevel>): string {
  if (level === 'low') return 'Strong';
  if (level === 'moderate') return 'Moderate';
  return 'Needs attention';
}

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { openEmergencyHome } = useEmergencyMode();
  const { offline } = useOfflineStatus();
  const { holdMs, onboardingStatus, completeOnboarding } = useSettings();
  const { supplies } = useSupplies();
  const { profile } = useHouseholdProfile();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const diameter = shortSide > 0 ? Math.min(240, Math.max(128, shortSide * 0.52)) : 200;
  const holdSeconds = Math.round(holdMs / 100) / 10;

  const waterDays = useMemo(
    () => (profile ? estimateWaterDays(supplies, profile) : null),
    [supplies, profile]
  );
  const foodDays = useMemo(
    () => (profile ? estimateFoodDays(supplies, profile) : null),
    [supplies, profile]
  );
  const powerScore = useMemo(() => powerReadinessScore(supplies), [supplies]);
  const medAlerts = useMemo(() => medicineAlertCount(supplies), [supplies]);
  const risk = useMemo(
    () => computeRiskLevel(waterDays, foodDays, medAlerts),
    [waterDays, foodDays, medAlerts]
  );
  const nextAction = useMemo(
    () =>
      profile
        ? nextRecommendedAction(supplies, profile)
        : 'Add a household profile for better estimates.',
    [supplies, profile]
  );

  const riskColor =
    risk === 'elevated' ? theme.danger : risk === 'moderate' ? theme.warning : theme.success;

  const powerLine =
    powerScore === null ? 'Power — add items' : `Power ${Math.round(powerScore * 100)}% at target`;
  const medLine = medAlerts === 0 ? 'Meds — ok' : `Meds — ${medAlerts} alert(s)`;

  return (
    <Screen>
      <WelcomeModal
        visible={onboardingStatus === 'needed'}
        onContinue={() => void completeOnboarding()}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {offline ? (
          <View
            style={[
              styles.offlineBanner,
              {
                backgroundColor: theme.surfaceElevated,
                borderBottomColor: theme.border,
              },
            ]}
            accessibilityRole="alert"
          >
            <AppText variant="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
              Offline — data stays on device
            </AppText>
          </View>
        ) : null}

        <View style={styles.hero} accessibilityRole="header">
          <AppText variant="subtitle" style={{ color: theme.text }}>
            Prepare your household
          </AppText>
          <AppText muted variant="caption" style={styles.heroSub}>
            Hold Emergency for guided steps when something goes wrong.
          </AppText>
        </View>

        <View style={styles.sectionBlock}>
          <AppText variant="label" style={[styles.sectionLabel, { color: theme.textMuted }]}>
            If something&apos;s wrong
          </AppText>
          <View style={styles.emergencyWrap}>
            <Pressable
              onLongPress={openEmergencyHome}
              accessibilityLabel="Emergency. Press and hold to open emergency mode."
              accessibilityHint={`Hold for about ${holdSeconds} seconds.`}
              accessibilityRole="button"
              delayLongPress={holdMs}
              style={({ pressed }) => [
                styles.circle,
                {
                  width: diameter,
                  height: diameter,
                  borderRadius: diameter / 2,
                  backgroundColor: pressed ? '#b91c1c' : '#dc2626',
                  opacity: pressed ? 0.95 : 1,
                },
              ]}
            >
              <View style={styles.circleContent} collapsable={false}>
                <Text style={styles.labelEmergency}>Emergency</Text>
                <Text style={styles.labelPressHold}>press and hold</Text>
              </View>
            </Pressable>
            <AppText muted variant="caption" style={styles.holdHint}>
              Hold {holdSeconds}s to open guided help
            </AppText>
          </View>
        </View>

        <AppText variant="label" style={[styles.sectionLabel, { color: theme.textMuted, marginBottom: spacing.sm }]}>
          Readiness
        </AppText>
        <AppCard
          style={[
            styles.oneCard,
            {
              borderRadius: radius.lg,
              borderLeftWidth: 3,
              borderLeftColor: riskColor,
            },
          ]}
        >
          <AppText muted variant="caption" style={styles.nextStepLabel}>
            Suggested next step
          </AppText>
          <AppText style={[styles.nextLine, { color: theme.text }]} numberOfLines={5}>
            {nextAction}
          </AppText>

          <View style={[styles.snapshotBlock, { borderTopColor: theme.border }]}>
            <View style={styles.statusLine}>
              <Ionicons name="heart-outline" size={18} color={riskColor} />
              <AppText style={[styles.readinessText, { color: theme.text }]}>
                {readinessShortLabel(risk)} readiness
              </AppText>
            </View>
            <AppText muted variant="caption" style={styles.statsLine}>
              Water {formatDaysLabel(waterDays)} · Food {formatDaysLabel(foodDays)} · {powerLine} · {medLine}
            </AppText>
          </View>

          <Pressable
            onPress={() => router.push('/prepare/index')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open Prepare. Stock, plans, and guides."
            style={styles.prepareCta}
          >
            <AppText style={{ color: theme.accent, fontSize: 15, fontWeight: '600' }}>
              Open Prepare
            </AppText>
            <AppText muted variant="caption" style={styles.prepareCtaSub}>
              Stock, plans, and guides — one place
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/contacts/household')}
            hitSlop={8}
            style={styles.householdLink}
            accessibilityRole="link"
            accessibilityLabel="Household profile for estimates"
          >
            <AppText style={{ color: theme.contactsAccent, fontSize: 14 }}>Household profile</AppText>
          </Pressable>
        </AppCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  offlineBanner: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroSub: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  sectionBlock: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  emergencyWrap: {
    alignItems: 'center',
  },
  holdHint: { marginTop: spacing.sm },
  circle: {
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  circleContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  labelPressHold: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  labelEmergency: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  oneCard: {
    padding: spacing.md,
  },
  nextStepLabel: {
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    fontWeight: '600',
  },
  snapshotBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  readinessText: { fontSize: 15, fontWeight: '700' },
  statsLine: { lineHeight: 18 },
  nextLine: { lineHeight: 22, fontSize: 16, fontWeight: '600' },
  prepareCta: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  prepareCtaSub: {
    marginTop: 4,
    lineHeight: 18,
  },
  householdLink: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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

function riskLabel(level: ReturnType<typeof computeRiskLevel>): string {
  if (level === 'low') return 'Lower';
  if (level === 'moderate') return 'Moderate';
  return 'Elevated';
}

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { openEmergencyHome } = useEmergencyMode();
  const { offline } = useOfflineStatus();
  const { holdMs } = useSettings();
  const { supplies } = useSupplies();
  const { profile } = useHouseholdProfile();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const diameter = shortSide > 0 ? Math.min(260, Math.max(132, shortSide * 0.56)) : 220;
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
    () => (profile ? nextRecommendedAction(supplies, profile) : 'Complete your household profile for tailored tips.'),
    [supplies, profile]
  );

  const riskColor =
    risk === 'elevated' ? theme.danger : risk === 'moderate' ? theme.warning : theme.success;

  return (
    <Screen>
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
            <AppText variant="caption" style={{ color: theme.text, textAlign: 'center' }}>
              Offline — your data stays on this device.
            </AppText>
          </View>
        ) : null}

        <AppText variant="title" style={[styles.sectionTitle, { color: theme.text }]}>
          Household resilience
        </AppText>
        <AppText muted variant="caption" style={styles.sectionSub}>
          Track supplies, plans, and skills in one place — built for shortages and emergencies, not scattered apps.
        </AppText>

        <AppCard
          style={[
            styles.dashCard,
            {
              borderRadius: radius.lg,
              borderLeftWidth: 4,
              borderLeftColor: riskColor,
            },
          ]}
        >
          <View style={styles.dashRow}>
            <Ionicons name="pulse-outline" size={22} color={riskColor} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <AppText variant="subtitle" style={{ color: theme.text }}>
                Current risk level
              </AppText>
              <AppText style={{ color: theme.text, fontWeight: '700', fontSize: 18 }}>{riskLabel(risk)}</AppText>
              <AppText muted variant="caption" style={{ marginTop: spacing.xs, lineHeight: 18 }}>
                Based on water/food estimates and medicine alerts — refine with targets and daily use on supplies.
              </AppText>
            </View>
          </View>
        </AppCard>

        <View style={styles.metricsGrid}>
          <AppCard style={[styles.metric, { borderRadius: radius.md, borderLeftWidth: 3, borderLeftColor: theme.accent }]}>
            <AppText variant="caption" style={{ color: theme.textMuted }}>
              Water (est.)
            </AppText>
            <AppText variant="title" style={{ color: theme.text, marginTop: spacing.xs }}>
              {formatDaysLabel(waterDays)}
            </AppText>
          </AppCard>
          <AppCard style={[styles.metric, { borderRadius: radius.md, borderLeftWidth: 3, borderLeftColor: theme.accent }]}>
            <AppText variant="caption" style={{ color: theme.textMuted }}>
              Food (est.)
            </AppText>
            <AppText variant="title" style={{ color: theme.text, marginTop: spacing.xs }}>
              {formatDaysLabel(foodDays)}
            </AppText>
          </AppCard>
        </View>

        <AppCard
          style={[
            styles.dashCard,
            {
              borderRadius: radius.lg,
              borderLeftWidth: 4,
              borderLeftColor: theme.accent,
            },
          ]}
        >
          <AppText variant="label" style={{ color: theme.textMuted }}>
            Power readiness
          </AppText>
          <AppText style={{ color: theme.text, marginTop: spacing.xs }}>
            {powerScore === null
              ? 'Add power items to track.'
              : `${Math.round(powerScore * 100)}% of power items at target`}
          </AppText>
          <AppText variant="label" style={{ color: theme.textMuted, marginTop: spacing.md }}>
            Medicine alerts
          </AppText>
          <AppText style={{ color: theme.text, marginTop: spacing.xs }}>
            {medAlerts === 0 ? 'No urgent expiry or restock flags' : `${medAlerts} item(s) need attention`}
          </AppText>
        </AppCard>

        <AppCard
          style={[
            styles.dashCard,
            {
              borderRadius: radius.lg,
              borderLeftWidth: 4,
              borderLeftColor: theme.accent,
            },
          ]}
        >
          <AppText variant="subtitle" style={{ color: theme.text }}>
            Next step
          </AppText>
          <AppText style={{ color: theme.text, marginTop: spacing.sm, lineHeight: 22 }}>{nextAction}</AppText>
          <View style={styles.linksRow}>
            <Pressable onPress={() => router.push('/supplies')} accessibilityRole="button">
              <AppText style={{ color: theme.accent, fontWeight: '600' }}>Supplies</AppText>
            </Pressable>
            <AppText style={{ color: theme.textMuted }}> · </AppText>
            <Pressable onPress={() => router.push('/contacts/household')} accessibilityRole="button">
              <AppText style={{ color: theme.accent, fontWeight: '600' }}>Household</AppText>
            </Pressable>
            <AppText style={{ color: theme.textMuted }}> · </AppText>
            <Pressable onPress={() => router.push('/library')} accessibilityRole="button">
              <AppText style={{ color: theme.accent, fontWeight: '600' }}>Library</AppText>
            </Pressable>
          </View>
        </AppCard>

        <AppText variant="title" style={[styles.sectionTitle, { color: theme.text, marginTop: spacing.lg }]}>
          Emergency
        </AppText>
        <View style={styles.center}>
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
              <Text style={styles.labelEmergency}>Emergency Button</Text>
              <Text style={styles.labelPressHold}>press and hold</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
  },
  offlineBanner: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  sectionTitle: { marginBottom: spacing.xs },
  sectionSub: { lineHeight: 20, marginBottom: spacing.md },
  dashCard: { marginBottom: spacing.md, paddingVertical: spacing.md },
  dashRow: { flexDirection: 'row', alignItems: 'flex-start' },
  metricsGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  metric: { flex: 1, padding: spacing.md },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  circle: {
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  labelEmergency: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
});

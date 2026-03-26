import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';
import type { ScenarioDefinition } from '@/constants/scenarios';

const SCENARIO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  power_outage: 'flash-outline',
  long_power_loss: 'hourglass-outline',
  water_outage: 'water-outline',
  water_contamination: 'warning-outline',
  evacuation: 'walk-outline',
  shelter_in_place: 'home-outline',
  medical_emergency: 'medical-outline',
  medicine_shortage: 'medkit-outline',
  fire: 'flame-outline',
  severe_weather: 'thunderstorm-outline',
  no_communication: 'cellular-outline',
  food_shortage: 'restaurant-outline',
  fuel_shortage: 'car-outline',
  supply_chain_disruption: 'git-network-outline',
  inflation_pressure: 'cash-outline',
};

export function ScenarioCard({
  scenario,
  onPress,
}: {
  scenario: ScenarioDefinition;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const icon = SCENARIO_ICONS[scenario.id] ?? 'alert-circle-outline';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${scenario.title} scenario`}
      style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}
    >
      <AppCard
        style={[
          styles.card,
          {
            borderLeftWidth: 3,
            borderLeftColor: theme.accent,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: theme.emergencyMuted }]}>
            <Ionicons name={icon} size={18} color={theme.accent} />
          </View>
          <View style={styles.textCol}>
            <AppText variant="subtitle" style={{ color: theme.text }}>
              {scenario.title}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.textMuted} style={styles.chevron} />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.xs, borderRadius: radius.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  chevron: { opacity: 0.85 },
});

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';
import type { ScenarioDefinition } from '@/constants/scenarios';

export function ScenarioCard({
  scenario,
  onPress,
}: {
  scenario: ScenarioDefinition;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${scenario.title} scenario`}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      <AppCard style={styles.card}>
        <AppText variant="subtitle">{scenario.title}</AppText>
        <AppText muted style={styles.hint}>
          Tap to start
        </AppText>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  hint: { marginTop: spacing.xs },
});

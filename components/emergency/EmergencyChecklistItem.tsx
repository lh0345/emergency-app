import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';

import type { ChecklistItemRow } from '@/types';

export function EmergencyChecklistItem({
  item,
  onToggle,
}: {
  item: ChecklistItemRow;
  onToggle: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!item.done }}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <AppCard
        style={[
          styles.card,
          item.done ? { borderColor: theme.success, borderWidth: 2 } : null,
        ]}
      >
        <AppText
          style={[
            styles.text,
            item.done ? { textDecorationLine: 'line-through' as const, opacity: 0.75 } : null,
          ]}
        >
          {item.text}
        </AppText>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  text: { fontSize: 18, lineHeight: 26 },
});

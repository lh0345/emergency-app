import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';
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
  const done = !!item.done;

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <AppCard
        style={[
          styles.card,
          {
            borderRadius: radius.lg,
            borderWidth: done ? 2 : 1,
            borderColor: done ? theme.success : theme.border,
            backgroundColor: theme.surfaceElevated,
          },
        ]}
      >
        <View style={styles.row}>
          <View
            style={[
              styles.check,
              {
                borderColor: done ? theme.success : theme.textMuted,
                backgroundColor: done ? theme.success : 'transparent',
              },
            ]}
          >
            {done ? (
              <Ionicons name="checkmark" size={18} color="#ffffff" />
            ) : null}
          </View>
          <AppText
            style={[
              styles.text,
              { color: theme.text },
              done ? { textDecorationLine: 'line-through' as const, opacity: 0.8 } : null,
            ]}
          >
            {item.text}
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  check: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  text: { flex: 1, fontSize: 17, lineHeight: 25 },
});

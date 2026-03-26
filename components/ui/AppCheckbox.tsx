import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { getThemeColors } from '@/constants/Colors';
import { minTouchTarget, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';

import { AppText } from './AppText';

export function AppCheckbox({
  checked,
  label,
  onToggle,
  accentColor,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
  /** When set, used for the checked fill instead of theme accent. */
  accentColor?: string;
}) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const theme = getThemeColors(isDark);
  const fill = accentColor ?? theme.accent;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.row}
      hitSlop={8}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? fill : theme.border,
            backgroundColor: checked ? fill : theme.surfaceElevated,
          },
        ]}
      >
        {checked ? <Ionicons name="checkmark" size={16} color="#ffffff" /> : null}
      </View>
      <AppText style={[styles.label, { color: theme.text }]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: minTouchTarget,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 16 },
});

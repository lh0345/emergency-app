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
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const theme = getThemeColors(isDark);

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
            borderColor: theme.border,
            backgroundColor: checked ? theme.accent : theme.surfaceElevated,
          },
        ]}
      />
      <AppText style={styles.label}>{label}</AppText>
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
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
  },
  label: { flex: 1, fontSize: 16 },
});

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { spacing } from '@/constants/spacing';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  /** Defaults to theme accent */
  color?: string;
  style?: ViewStyle;
};

export function FabAdd({ onPress, accessibilityLabel, color, style }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const insets = useSafeAreaInsets();
  const bg = color ?? theme.accent;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: bg,
          bottom: spacing.md + insets.bottom,
          opacity: pressed ? 0.88 : 1,
        },
        style,
      ]}
    >
      <Ionicons name="add" size={26} color="#ffffff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
  },
});

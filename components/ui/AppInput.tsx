import React from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { getThemeColors } from '@/constants/Colors';
import { minTouchTarget, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';

export function AppInput(props: TextInputProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const theme = getThemeColors(isDark);

  return (
    <TextInput
      placeholderTextColor={theme.textMuted}
      style={[
        styles.input,
        {
          color: theme.text,
          borderColor: theme.border,
          backgroundColor: theme.surfaceElevated,
        },
        props.style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: minTouchTarget,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
});

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { getThemeColors } from '@/constants/Colors';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';

import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost';

export function AppButton({
  title,
  loading,
  variant = 'primary',
  style,
  disabled,
  accessibilityLabel,
  ...rest
}: PressableProps & {
  title: string;
  loading?: boolean;
  variant?: Variant;
}) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const theme = getThemeColors(isDark);

  const bg: Record<Variant, string> = {
    primary: theme.accent,
    secondary: theme.surfaceElevated,
    ghost: 'transparent',
  };
  const border: Record<Variant, string> = {
    primary: theme.accent,
    secondary: theme.border,
    ghost: theme.border,
  };
  const textColor =
    variant === 'primary' ? '#ffffff' : variant === 'secondary' ? theme.text : theme.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={disabled || loading}
      style={({ pressed }) =>
        [
          styles.root,
          {
            backgroundColor: bg[variant],
            borderColor: border[variant],
            opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
          },
          variant !== 'ghost' && styles.bordered,
          style as ViewStyle,
        ]
      }
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.accent} />
      ) : (
        <AppText style={[styles.label, { color: textColor }]}>{title}</AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: {
    borderWidth: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});

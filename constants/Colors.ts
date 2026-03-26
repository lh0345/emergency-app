/**
 * High-contrast tokens for emergency-first UI.
 * Use with StyleSheet; pair with useColorScheme for light/dark.
 */

export const palette = {
  accent: '#dc2626',
  accentMuted: '#b91c1c',
  surface: '#0f172a',
  surfaceElevated: '#1e293b',
  border: '#334155',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  overlay: 'rgba(15, 23, 42, 0.92)',
} as const;

export const paletteLight = {
  accent: '#b91c1c',
  accentMuted: '#991b1b',
  surface: '#f8fafc',
  surfaceElevated: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  success: '#15803d',
  warning: '#d97706',
  danger: '#dc2626',
  overlay: 'rgba(248, 250, 252, 0.95)',
} as const;

export type ThemeColors = typeof palette;

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? palette : (paletteLight as unknown as ThemeColors);
}

/** Legacy shape for `components/Themed.tsx` and any template leftovers */
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

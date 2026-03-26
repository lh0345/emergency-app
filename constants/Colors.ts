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
  /** Subtle fills / banners in emergency flows */
  emergencyMuted: 'rgba(220, 38, 38, 0.14)',
  emergencyBanner: 'rgba(220, 38, 38, 0.1)',
  /** Contacts section — distinct from emergency red */
  contactsAccent: '#60a5fa',
  contactsMuted: 'rgba(59, 130, 246, 0.16)',
  contactsBanner: 'rgba(59, 130, 246, 0.1)',
  /** Library / guides — reading content */
  libraryAccent: '#a78bfa',
  libraryMuted: 'rgba(139, 92, 246, 0.18)',
  libraryBanner: 'rgba(139, 92, 246, 0.1)',
  /** Supplies / inventory */
  suppliesAccent: '#2dd4bf',
  suppliesMuted: 'rgba(45, 212, 191, 0.16)',
  suppliesBanner: 'rgba(45, 212, 191, 0.1)',
  /** Plans / preparedness */
  plansAccent: '#fbbf24',
  plansMuted: 'rgba(251, 191, 36, 0.18)',
  plansBanner: 'rgba(251, 191, 36, 0.1)',
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
  emergencyMuted: 'rgba(185, 28, 28, 0.08)',
  emergencyBanner: 'rgba(185, 28, 28, 0.06)',
  contactsAccent: '#2563eb',
  contactsMuted: 'rgba(37, 99, 235, 0.1)',
  contactsBanner: 'rgba(37, 99, 235, 0.07)',
  libraryAccent: '#7c3aed',
  libraryMuted: 'rgba(124, 58, 237, 0.1)',
  libraryBanner: 'rgba(124, 58, 237, 0.07)',
  suppliesAccent: '#0d9488',
  suppliesMuted: 'rgba(13, 148, 136, 0.12)',
  suppliesBanner: 'rgba(13, 148, 136, 0.07)',
  plansAccent: '#d97706',
  plansMuted: 'rgba(217, 119, 6, 0.12)',
  plansBanner: 'rgba(217, 119, 6, 0.07)',
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

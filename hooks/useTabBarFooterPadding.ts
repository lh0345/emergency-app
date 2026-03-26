import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { screenPadding } from '@/constants/layout';
import { spacing } from '@/constants/spacing';

/**
 * Padding for a bottom bar that sits above the tab bar. Adds the device bottom inset
 * (home indicator / gesture area) when the OS reports it so content does not collide.
 */
export function useTabBarFooterPadding() {
  const insets = useSafeAreaInsets();

  return useMemo(
    () => ({
      paddingHorizontal: screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg + insets.bottom,
    }),
    [insets.bottom]
  );
}

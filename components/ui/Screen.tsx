import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';

const TAB_EDGES: Edge[] = ['top', 'left', 'right'];
const MODAL_EDGES: Edge[] = ['top', 'left', 'right', 'bottom'];

type Props = {
  children: React.ReactNode;
  /** Tab screens: omit bottom safe area (tab bar handles it). Modal/full-screen: all edges. */
  variant?: 'tab' | 'modal';
  /** Overrides variant edges when set. */
  edges?: Edge[];
  /** Show top row with back control (uses `router.back()` when possible). */
  back?: boolean;
  title?: string;
  style?: ViewStyle;
};

export function Screen({ children, variant = 'tab', edges, back, title, style }: Props) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const resolvedEdges = edges ?? (variant === 'modal' ? MODAL_EDGES : TAB_EDGES);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }, style]} edges={resolvedEdges}>
      {back ? (
        <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={goBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </Pressable>
          {title ? (
            <AppText variant="subtitle" numberOfLines={1} style={[styles.headerTitle, { color: theme.text }]}>
              {title}
            </AppText>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: spacing.xs,
    paddingRight: screenPadding,
    minHeight: 40,
  },
  backBtn: {
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  headerTitle: { flex: 1, fontWeight: '700' },
  headerSpacer: { flex: 1 },
  body: { flex: 1 },
});

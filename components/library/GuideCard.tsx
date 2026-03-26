import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';
import type { GuideRow as GuideRowData, LibraryGroup } from '@/types';

const GROUP_LABEL: Record<LibraryGroup, string> = {
  emergency: 'Emergency',
  self_reliance: 'Self-reliance',
};

export function GuideCard({
  guide,
  onPress,
}: {
  guide: GuideRowData;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={guide.title}
    >
      <AppCard
        style={[
          styles.card,
          {
            borderLeftWidth: 3,
            borderLeftColor: theme.libraryAccent,
            borderRadius: radius.md,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.textCol}>
            <AppText variant="subtitle" style={{ color: theme.text }} numberOfLines={2}>
              {guide.title}
            </AppText>
            <AppText muted variant="caption" numberOfLines={2} style={styles.overview}>
              {guide.overview}
            </AppText>
            <AppText muted variant="caption" style={styles.metaLine}>
              {guide.category} · {GROUP_LABEL[guide.libraryGroup as LibraryGroup]} · {guide.readingTime} min
              {guide.bookmarked ? ' · saved' : ''}
            </AppText>
          </View>
          {guide.bookmarked ? (
            <Ionicons name="bookmark" size={18} color={theme.libraryAccent} style={styles.bookmark} />
          ) : (
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={styles.chevron} />
          )}
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  textCol: { flex: 1, minWidth: 0 },
  overview: { marginTop: 4, lineHeight: 18 },
  metaLine: { marginTop: spacing.sm, fontSize: 12 },
  bookmark: { marginTop: 2 },
  chevron: { marginTop: 4, opacity: 0.7 },
});

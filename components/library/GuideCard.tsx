import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { radius, spacing } from '@/constants/spacing';
import type { GuideRow as GuideRowData } from '@/types';

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
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}
      accessibilityRole="button"
      accessibilityLabel={guide.title}
    >
      <AppCard
        style={[
          styles.card,
          {
            borderLeftWidth: 4,
            borderLeftColor: theme.libraryAccent,
            borderRadius: radius.lg,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: theme.libraryMuted }]}>
            <Ionicons name="book-outline" size={22} color={theme.libraryAccent} />
          </View>
          <View style={styles.textCol}>
            <AppText variant="subtitle" style={{ color: theme.text }}>
              {guide.title}
            </AppText>
            <AppText muted variant="caption" numberOfLines={2} style={styles.overview}>
              {guide.overview}
            </AppText>
            <View style={styles.meta}>
              <View style={[styles.cat, { backgroundColor: theme.libraryMuted }]}>
                <AppText variant="caption" style={{ color: theme.libraryAccent, fontSize: 12, fontWeight: '600' }}>
                  {guide.category}
                </AppText>
              </View>
              {guide.bookmarked ? (
                <View style={styles.saved}>
                  <Ionicons name="bookmark" size={14} color={theme.libraryAccent} />
                  <AppText variant="caption" style={{ color: theme.libraryAccent, fontSize: 12, fontWeight: '600' }}>
                    Saved
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.textMuted} style={styles.chevron} />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  overview: { marginTop: 4, lineHeight: 20 },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cat: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  saved: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chevron: { opacity: 0.85 },
});

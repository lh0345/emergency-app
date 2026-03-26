import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge } from '@/components/ui/AppBadge';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';
import type { GuideRow as GuideRowData } from '@/types';

export function GuideCard({
  guide,
  onPress,
}: {
  guide: GuideRowData;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={guide.title}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="subtitle">{guide.title}</AppText>
        <AppText muted numberOfLines={2}>
          {guide.overview}
        </AppText>
      </View>
      {guide.bookmarked ? <AppBadge text="Saved" tone="success" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#33415555',
  },
});

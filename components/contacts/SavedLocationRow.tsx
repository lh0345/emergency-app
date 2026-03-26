import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import type { SavedLocationRow as SavedLocationRowData } from '@/types';

function typeLabel(type: SavedLocationRowData['type']) {
  return type.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SavedLocationRow({
  location,
  onOpen,
}: {
  location: SavedLocationRowData;
  onOpen: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <AppCard
      style={[
        styles.card,
        {
          borderLeftWidth: 3,
          borderLeftColor: theme.contactsAccent,
          borderRadius: radius.lg,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <Pressable
        onPress={onOpen}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel={`${location.name}, open saved location`}
      >
        <View style={[styles.avatar, { backgroundColor: theme.contactsMuted }]}>
          <Ionicons name="location" size={18} color={theme.contactsAccent} />
        </View>
        <View style={styles.textCol}>
          <AppText variant="subtitle" style={{ color: theme.text }}>
            {location.name}
          </AppText>
          <AppText muted variant="caption" numberOfLines={2} style={styles.address}>
            {location.address}
          </AppText>
          <View style={[styles.typePill, { backgroundColor: theme.contactsMuted }]}>
            <AppText variant="caption" style={{ color: theme.contactsAccent, fontSize: 12, fontWeight: '600' }}>
              {typeLabel(location.type)}
            </AppText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.textMuted} style={styles.chevron} />
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: minTouchTarget,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  address: { marginTop: 2 },
  typePill: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  chevron: { opacity: 0.85 },
});

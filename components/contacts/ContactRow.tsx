import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { openDialer, openSms } from '@/utils/linking';
import type { ContactRow as ContactRowData } from '@/types';

function typeLabel(type: ContactRowData['type']) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ContactRow({
  contact,
  onOpen,
  smsDefaultBody,
}: {
  contact: ContactRowData;
  onOpen: () => void;
  smsDefaultBody: string;
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
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={onOpen}
          style={styles.mainTap}
          accessibilityRole="button"
          accessibilityLabel={`${contact.name}, open contact`}
        >
          <View style={[styles.avatar, { backgroundColor: theme.contactsMuted }]}>
            <Ionicons name="person" size={18} color={theme.contactsAccent} />
          </View>
          <View style={styles.textCol}>
            <AppText variant="subtitle" style={{ color: theme.text }}>
              {contact.name}
            </AppText>
            <AppText muted variant="caption" style={styles.phone}>
              {contact.phone}
            </AppText>
            <View style={[styles.typePill, { backgroundColor: theme.contactsMuted }]}>
              <AppText variant="caption" style={{ color: theme.contactsAccent, fontSize: 12, fontWeight: '600' }}>
                {typeLabel(contact.type)}
              </AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={styles.chevron} />
        </Pressable>

        <View style={styles.quick}>
          <Pressable
            onPress={() => void openDialer(contact.phone)}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityLabel={`Call ${contact.name}`}
            accessibilityRole="button"
          >
            <Ionicons name="call" size={18} color={theme.contactsAccent} />
          </Pressable>
          <Pressable
            onPress={() => void openSms(contact.phone, smsDefaultBody)}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityLabel={`SMS ${contact.name}`}
            accessibilityRole="button"
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.contactsAccent} />
          </Pressable>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  mainTap: {
    flex: 1,
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
  phone: { marginTop: 2 },
  typePill: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  chevron: { opacity: 0.85 },
  quick: { justifyContent: 'center', gap: spacing.sm, paddingLeft: spacing.xs },
  iconBtn: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

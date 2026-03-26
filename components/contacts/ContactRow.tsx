import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';
import { openDialer, openSms } from '@/utils/linking';
import type { ContactRow as ContactRowData } from '@/types';

export function ContactRow({
  contact,
  onOpen,
}: {
  contact: ContactRowData;
  onOpen: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable onPress={onOpen} style={{ flex: 1 }} accessibilityRole="button">
          <AppText variant="subtitle">{contact.name}</AppText>
          <AppText muted>{contact.phone}</AppText>
          <AppText muted style={styles.type}>
            {contact.type.replace('_', ' ')}
          </AppText>
        </Pressable>
        <View style={styles.actions}>
          <AppButton
            title="Call"
            variant="secondary"
            style={styles.btn}
            onPress={() => openDialer(contact.phone)}
          />
          <AppButton
            title="SMS"
            variant="ghost"
            style={styles.btn}
            onPress={() => openSms(contact.phone)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#33415555' },
  row: { flexDirection: 'row', gap: spacing.md },
  type: { textTransform: 'capitalize' },
  actions: { justifyContent: 'center', gap: spacing.sm },
  btn: { minHeight: 44, paddingHorizontal: spacing.sm },
});

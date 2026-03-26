import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';

export function ActionStepCard({ index, text }: { index: number; text: string }) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <AppText variant="label" style={styles.idx}>
          {index + 1}
        </AppText>
        <AppText style={styles.text}>{text}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  idx: { width: 28 },
  text: { flex: 1, fontSize: 17, lineHeight: 24 },
});

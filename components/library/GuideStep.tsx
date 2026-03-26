import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';

import type { GuideStep as GuideStepType } from '@/types';

export function GuideStep({ step, index }: { step: GuideStepType; index: number }) {
  return (
    <View style={styles.wrap}>
      <AppText variant="label" style={styles.idx}>
        {index + 1}.
      </AppText>
      <View style={{ flex: 1 }}>
        <AppText variant="subtitle">{step.title}</AppText>
        {step.detail ? <AppText style={styles.detail}>{step.detail}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  idx: { width: 28 },
  detail: { marginTop: spacing.xs, lineHeight: 22 },
});
